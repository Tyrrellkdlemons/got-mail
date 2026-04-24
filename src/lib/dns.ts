/**
 * DNS lookups via Google's public DNS-over-HTTPS (free, no auth).
 * Docs: https://developers.google.com/speed/public-dns/docs/doh/json
 */

const DOH = "https://dns.google/resolve";

type DnsRecord = { name: string; type: number; TTL: number; data: string };

type DohResponse = {
  Status: number;
  Answer?: DnsRecord[];
  Authority?: DnsRecord[];
};

async function resolve(name: string, type: string): Promise<DnsRecord[]> {
  try {
    const url = `${DOH}?name=${encodeURIComponent(name)}&type=${type}`;
    const res = await fetch(url, {
      headers: { accept: "application/dns-json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: DohResponse = await res.json();
    return data.Answer ?? [];
  } catch {
    return [];
  }
}

export type DnsCheck = {
  type: string;
  name: string;
  value: string | null;
  pass: boolean;
  note?: string;
};

export async function checkSpf(domain: string): Promise<DnsCheck> {
  const records = await resolve(domain, "TXT");
  const spf = records
    .map((r) => r.data.replace(/^"|"$/g, ""))
    .find((s) => /^v=spf1/i.test(s));
  if (!spf) {
    return { type: "SPF", name: domain, value: null, pass: false, note: "No SPF record found." };
  }
  return {
    type: "SPF",
    name: domain,
    value: spf,
    pass: /[-~]all/i.test(spf),
    note: /[-~]all/i.test(spf)
      ? "Valid, ends with a qualifier."
      : "Exists but missing a terminating `-all` or `~all`.",
  };
}

export async function checkDmarc(domain: string): Promise<DnsCheck> {
  const records = await resolve(`_dmarc.${domain}`, "TXT");
  const dmarc = records
    .map((r) => r.data.replace(/^"|"$/g, ""))
    .find((s) => /^v=DMARC1/i.test(s));
  if (!dmarc) {
    return {
      type: "DMARC",
      name: `_dmarc.${domain}`,
      value: null,
      pass: false,
      note: "No DMARC record found.",
    };
  }
  const policy = /p=(none|quarantine|reject)/i.exec(dmarc)?.[1] ?? "unknown";
  return {
    type: "DMARC",
    name: `_dmarc.${domain}`,
    value: dmarc,
    pass: true,
    note: `Policy: p=${policy}`,
  };
}

export async function checkMx(domain: string): Promise<DnsCheck> {
  const records = await resolve(domain, "MX");
  if (!records.length) {
    return { type: "MX", name: domain, value: null, pass: false, note: "No MX records." };
  }
  return {
    type: "MX",
    name: domain,
    value: records.map((r) => r.data).join(" | "),
    pass: true,
    note: `${records.length} MX record${records.length === 1 ? "" : "s"} found.`,
  };
}

export async function checkDkim(domain: string, selectors = ["resend", "default", "google", "k1", "s1", "selector1"]): Promise<DnsCheck> {
  for (const selector of selectors) {
    const records = await resolve(`${selector}._domainkey.${domain}`, "TXT");
    const cname = await resolve(`${selector}._domainkey.${domain}`, "CNAME");
    if (records.length || cname.length) {
      const value =
        records.map((r) => r.data.replace(/^"|"$/g, "")).join(" ") ||
        cname.map((r) => r.data).join(" ");
      return {
        type: "DKIM",
        name: `${selector}._domainkey.${domain}`,
        value,
        pass: true,
        note: `Selector "${selector}" found.`,
      };
    }
  }
  return {
    type: "DKIM",
    name: `<selector>._domainkey.${domain}`,
    value: null,
    pass: false,
    note: `No DKIM selector found in: ${selectors.join(", ")}. Your provider may use a different selector.`,
  };
}

export async function runDomainAudit(domain: string) {
  const clean = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  const [spf, dkim, dmarc, mx] = await Promise.all([
    checkSpf(clean),
    checkDkim(clean),
    checkDmarc(clean),
    checkMx(clean),
  ]);
  return { domain: clean, checks: [spf, dkim, dmarc, mx] };
}

/** Check a hostname against public blacklists (RBLs) via DNS. Returns list of hits. */
const RBLS = [
  "zen.spamhaus.org",
  "bl.spamcop.net",
  "b.barracudacentral.org",
  "dnsbl.sorbs.net",
  "cbl.abuseat.org",
  "psbl.surriel.com",
];

/** RBLs need IPv4 in reverse-notation. For now we resolve the host's A record first. */
export async function checkBlacklists(host: string): Promise<{ listed: string[]; checked: string[]; ip: string | null }> {
  const a = await resolve(host, "A");
  const ip = a[0]?.data ?? null;
  if (!ip) return { listed: [], checked: RBLS, ip: null };
  const reverse = ip.split(".").reverse().join(".");

  const results = await Promise.all(
    RBLS.map(async (rbl) => {
      const r = await resolve(`${reverse}.${rbl}`, "A");
      return { rbl, listed: r.length > 0 };
    })
  );
  return {
    listed: results.filter((r) => r.listed).map((r) => r.rbl),
    checked: RBLS,
    ip,
  };
}
