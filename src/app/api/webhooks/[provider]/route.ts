// Next.js App Router webhook handler — one route covers every provider.
// Provider name comes from the URL: /api/webhooks/resend, /api/webhooks/brevo, ...
// Configure each provider's dashboard to POST events here.
//
// SECURITY: each provider sends a signature header. Verify it before trusting the body.
// Stubs below are minimal — fill in the per-provider verifier you need.

import { NextRequest, NextResponse } from "next/server";
import { PARSERS } from "@/lib/extended/webhooks";
import { addSuppression } from "@/lib/extended/suppression";
import { recordBounce } from "@/lib/extended/routing";
// import { db } from "@/lib/db"; // your existing prisma client

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider.toLowerCase();
  const parser = PARSERS[provider];
  if (!parser) return new NextResponse("unknown provider", { status: 404 });

  // TODO: verify signature per provider here. For now we trust the request.
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("bad body", { status: 400 });

  const events = parser(body, req.headers);

  // Look up the receiving ProviderAccount by the message id so we know which user/account
  // this event belongs to. Skipped here for brevity — implement against your `Send` table.
  // const db = ...
  // for (const e of events) {
  //   const send = await db.send.findFirst({ where: { providerMessageId: e.providerMessageId } });
  //   if (!send) continue;
  //   if (e.type === "bounced" || e.type === "complained" || e.type === "unsubscribed") {
  //     await addSuppression(db, {
  //       userId: send.userId,
  //       email: e.recipient!,
  //       reason: e.type === "unsubscribed" ? "UNSUBSCRIBE" : e.type === "complained" ? "COMPLAINT" : "BOUNCE_HARD",
  //       note: e.reason,
  //       providerMessageId: e.providerMessageId,
  //     });
  //     if (e.type === "bounced") await recordBounce(db, send.providerAccountId);
  //   }
  // }

  return NextResponse.json({ ok: true, eventsAccepted: events.length });
}
