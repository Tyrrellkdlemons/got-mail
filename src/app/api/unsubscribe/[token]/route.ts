import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * One-click unsubscribe endpoint (Gmail/Yahoo 2024 requirement).
 * POSTed to from the List-Unsubscribe-Post header.
 */
export async function POST(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const recipient = await prisma.campaignRecipient.findUnique({
    where: { id: params.token },
    include: { contact: true, campaign: true },
  });

  if (!recipient?.contact) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id: recipient.contactId },
      data: { consentStatus: "UNSUBSCRIBED" },
    });
    await tx.unsubscribe.create({
      data: {
        workspaceId: recipient.campaign.workspaceId,
        email: recipient.contact!.email,
        campaignId: recipient.campaignId,
        source: "one-click-header",
      },
    });
    await tx.suppression.upsert({
      where: {
        workspaceId_email: {
          workspaceId: recipient.campaign.workspaceId,
          email: recipient.contact!.email,
        },
      },
      update: {},
      create: {
        workspaceId: recipient.campaign.workspaceId,
        email: recipient.contact!.email,
        reason: "UNSUBSCRIBE",
      },
    });
    await tx.consentRecord.create({
      data: {
        workspaceId: recipient.campaign.workspaceId,
        contactId: recipient.contactId,
        event: "UNSUBSCRIBE",
        source: "one-click",
      },
    });
  });

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, ctx: { params: { token: string } }) {
  return POST(_req, ctx);
}
