import { PageHeader } from "@/components/ui/PageHeader";

const STEPS = [
  { num: 1, title: "Add your domain", body: "Pick a domain you own (e.g. yourcompany.com)." },
  { num: 2, title: "Publish SPF record", body: 'One TXT at the root: v=spf1 include:<provider-spf> ~all' },
  { num: 3, title: "Publish DKIM records", body: "Your provider will give you 1–3 CNAME (or TXT) records." },
  { num: 4, title: "Publish DMARC", body: 'Start with: _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourcompany.com"' },
  { num: 5, title: "Configure return-path / bounce", body: "Align bounce handling with your sending domain." },
  { num: 6, title: "Tracking domain (optional)", body: "Only if you enable open/click tracking." },
  { num: 7, title: "Verify sender address", body: "Confirm the From email with a double-opt-in click." },
  { num: 8, title: "Run deliverability check", body: "Got Mail sends a test to a seed address, parses headers, and scores inbox placement." },
  { num: 9, title: "Mark domain ready", body: "SPF ✓ DKIM ✓ DMARC ✓ — you're cleared to send." },
];

export default function DomainWizardPage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ domain setup wizard"
        title="Teach Got Mail to send from your domain."
        subtitle="Nine steps. SPF, DKIM, DMARC, return-path, tracking, verify. 1,000+ sending is blocked until this is green."
      />
      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li key={s.num} className="panel flex gap-4 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-chunky bg-envelope-500 font-display text-2xl text-aol-900 shadow-pop">
              {s.num}
            </div>
            <div>
              <h3 className="font-display text-xl text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-white/70">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
