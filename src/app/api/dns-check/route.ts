import { NextRequest, NextResponse } from "next/server";
import { runDomainAudit, checkBlacklists } from "@/lib/dns";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ ok: false, error: "Missing ?domain=" }, { status: 400 });
  }
  const includeBlacklist = req.nextUrl.searchParams.get("blacklist") === "1";

  const audit = await runDomainAudit(domain);
  const blacklist = includeBlacklist ? await checkBlacklists(audit.domain) : null;
  return NextResponse.json({ ok: true, audit, blacklist });
}
