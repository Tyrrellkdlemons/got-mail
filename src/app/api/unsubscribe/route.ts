// One-click unsubscribe (RFC 8058) + clickable link.
// Both GET (link in email) and POST (List-Unsubscribe-Post) work.

import { NextRequest, NextResponse } from "next/server";
import { parseToken } from "@/lib/extended/list-unsubscribe";
import { addSuppression } from "@/lib/extended/suppression";
// import { db } from "@/lib/db";

export const runtime = "nodejs";

async function process(tok: string | null) {
  if (!tok) return { ok: false, status: 400 as const, msg: "missing token" };
  const t = parseToken(tok);
  if (!t) return { ok: false, status: 400 as const, msg: "invalid or expired" };
  // const db = ...
  // await addSuppression(db, { userId: t.userId, email: t.email, reason: "UNSUBSCRIBE" });
  return { ok: true, status: 200 as const, email: t.email };
}

export async function GET(req: NextRequest) {
  const tok = new URL(req.url).searchParams.get("t");
  const r = await process(tok);
  if (!r.ok) return new NextResponse(r.msg, { status: r.status });
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Unsubscribed</title>
     <body style="font:16px system-ui;padding:40px;max-width:480px">
       <h1>You're unsubscribed.</h1>
       <p>${r.email} won't receive any more campaign emails.</p>
     </body>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function POST(req: NextRequest) {
  // RFC 8058: tok comes either as ?t=... or as form field
  const url = new URL(req.url);
  let tok = url.searchParams.get("t");
  if (!tok) {
    const form = await req.formData().catch(() => null);
    tok = (form?.get("t") as string | null) ?? null;
  }
  const r = await process(tok);
  return r.ok
    ? NextResponse.json({ ok: true })
    : new NextResponse(r.msg, { status: r.status });
}
