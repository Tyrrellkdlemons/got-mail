import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const base = z.object({
  mode: z.enum(["MY_EMAIL", "OWNED_DOMAIN", "FREE_DOMAIN", "OPEN_SOURCE"]),
  name: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional().or(z.literal("")),
  providerKind: z.string().optional(),
  domain: z.string().optional(),
  dailyLimit: z.coerce.number().int().positive().optional(),
  hourlyLimit: z.coerce.number().int().positive().optional(),
});

const smtpSchema = base.extend({
  smtp: z.object({
    host: z.string().min(1),
    port: z.coerce.number().int().positive(),
    username: z.string().min(1),
    password: z.string().min(1),
    useTls: z.boolean().default(true),
    providerType: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) return NextResponse.json({ ok: false, error: "No workspace. Run the seed first." }, { status: 400 });

  let body: z.infer<typeof smtpSchema>;
  try {
    body = smtpSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Invalid payload" }, { status: 400 });
  }

  // Optional: find-or-create Domain
  let domainId: string | null = null;
  if (body.domain) {
    const existing = await prisma.domain.findFirst({
      where: { workspaceId: workspace.id, domain: body.domain },
    });
    if (existing) {
      domainId = existing.id;
    } else {
      const d = await prisma.domain.create({
        data: {
          workspaceId: workspace.id,
          domain: body.domain,
          status: "PENDING",
          freeSubdomain: body.mode === "FREE_DOMAIN",
        },
      });
      domainId = d.id;
    }
  }

  // Optional: create SMTPAccount
  let smtpAccountId: string | null = null;
  if (body.smtp) {
    const s = await prisma.sMTPAccount.create({
      data: {
        workspaceId: workspace.id,
        label: body.name,
        host: body.smtp.host,
        port: body.smtp.port,
        username: body.smtp.username,
        passwordEnc: encryptSecret(body.smtp.password),
        useTls: body.smtp.useTls,
        fromEmail: body.fromEmail,
        fromName: body.fromName,
        dailyLimit: body.dailyLimit,
        hourlyLimit: body.hourlyLimit,
        providerType: body.smtp.providerType,
        verifiedAt: new Date(),
      },
    });
    smtpAccountId = s.id;
  }

  const identity = await prisma.sendingIdentity.create({
    data: {
      workspaceId: workspace.id,
      mode: body.mode,
      name: body.name,
      fromName: body.fromName,
      fromEmail: body.fromEmail,
      replyTo: body.replyTo || null,
      providerKind: body.providerKind ?? "smtp",
      domainId,
      smtpAccountId,
      dailyLimit: body.dailyLimit,
      hourlyLimit: body.hourlyLimit,
      isDefault: false,
    },
  });

  return NextResponse.json({ ok: true, id: identity.id });
}
