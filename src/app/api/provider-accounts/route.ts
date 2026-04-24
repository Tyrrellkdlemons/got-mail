import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import { getProvider } from "@/lib/providers";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  providerKind: z.enum(["brevo", "mailjet", "resend", "postmark", "sendgrid", "postal", "listmonk", "mautic"]),
  label: z.string().min(1).max(100),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  validate: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) return NextResponse.json({ ok: false, error: "No workspace. Run the seed first." }, { status: 400 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Invalid payload" }, { status: 400 });
  }

  // Validate by hitting the provider before storing
  if (body.validate) {
    try {
      const provider = getProvider(body.providerKind);
      const ping = await provider.validateConnection({
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        baseUrl: body.baseUrl || undefined,
      });
      if (!ping.ok) {
        return NextResponse.json({ ok: false, error: `Provider validation failed: ${ping.error}` }, { status: 400 });
      }
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message ?? "Provider threw" }, { status: 500 });
    }
  }

  const record = await prisma.providerAccount.create({
    data: {
      workspaceId: workspace.id,
      providerKind: body.providerKind,
      label: body.label,
      apiKeyEnc: body.apiKey ? encryptSecret(body.apiKey) : null,
      apiSecretEnc: body.apiSecret ? encryptSecret(body.apiSecret) : null,
      baseUrl: body.baseUrl || null,
      verifiedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, id: record.id });
}
