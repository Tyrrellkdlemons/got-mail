import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) return NextResponse.json({ ok: true, accounts: [] });
  const rows = await prisma.providerAccount.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, providerKind: true, label: true, baseUrl: true, verifiedAt: true, createdAt: true },
  });
  return NextResponse.json({
    ok: true,
    accounts: rows.map((r) => ({
      ...r,
      verifiedAt: r.verifiedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
