import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Returns the segments and sending identities available for the new-campaign form. */
export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
    if (!workspace) {
      return NextResponse.json({ ok: true, segments: [], identities: [] });
    }
    const [segments, identities] = await Promise.all([
      prisma.segment.findMany({
        where: { workspaceId: workspace.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.sendingIdentity.findMany({
        where: { workspaceId: workspace.id },
        select: { id: true, name: true, fromEmail: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return NextResponse.json({ ok: true, segments, identities });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
