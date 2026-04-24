import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UnsubscribesPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const items = workspace
    ? await prisma.unsubscribe.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ unsubscribes"
        title="Respected. Always."
        subtitle="Every unsubscribe event. One-click header and in-body link both route here."
      />
      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Campaign</th>
              <th className="px-4 py-3 text-left">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr><td className="px-4 py-6 text-white/60" colSpan={4}>No unsubscribes yet.</td></tr>
            )}
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono">{u.email}</td>
                <td className="px-4 py-3 text-xs text-white/60">{u.source ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">{u.campaignId ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">{u.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
