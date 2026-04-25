import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  subject: z.string().min(1).max(200),
  previewText: z.string().max(200).optional().nullable(),
  bodyText: z.string().min(1),
  providerKind: z.string().min(1),
  segmentId: z.string().nullable().optional(),
  sendingIdentityId: z.string().nullable().optional(),
});

function toHtml(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linked = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  const paragraphs = linked.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:600px;margin:0 auto;padding:16px;">${paragraphs}</body></html>`;
}

export async function POST(req: NextRequest) {
  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "Invalid payload: " + (e?.message ?? String(e)) }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) {
    return NextResponse.json({ ok: false, error: "No default workspace. Run the seed first." }, { status: 400 });
  }

  // Resolve sending identity. If not provided, pick the workspace's first.
  let sendingIdentityId = payload.sendingIdentityId || null;
  if (!sendingIdentityId) {
    const ident = await prisma.sendingIdentity.findFirst({ where: { workspaceId: workspace.id } });
    sendingIdentityId = ident?.id ?? null;
  }
  if (!sendingIdentityId) {
    return NextResponse.json(
      { ok: false, error: "No sending identity configured. Set one up in the identity wizard before creating a campaign." },
      { status: 400 }
    );
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        sendingIdentityId,
        segmentId: payload.segmentId || null,
        name: payload.name,
        subject: payload.subject,
        preheader: payload.previewText || null,
        html: toHtml(payload.bodyText),
        text: payload.bodyText,
        status: "DRAFT",
        complianceJson: JSON.stringify({
          providerKind: payload.providerKind,
          createdVia: "campaigns/new UI",
        }),
      },
    });
    return NextResponse.json({ ok: true, campaign: { id: campaign.id, name: campaign.name } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "DB error: " + (e?.message ?? String(e)) },
      { status: 500 }
    );
  }
}
