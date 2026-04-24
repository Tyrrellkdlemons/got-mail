import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuppressionPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const [items, total] = workspace
    ? await Promise.all([
        prisma.suppression.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          take: 200,
        }).catch(() => []),
        prisma.suppression.count({ where: { workspaceId: workspace.id } }).catch(() => 0),
      ])
    : [[], 0];

  return (
    <div>
      <PageHeader
        eyebrow="★ suppression list"
        title="Never email these people again."
        subtitle="Combined list of unsubscribes, hard bounces, complaints, and manual blocks. Checked at campaign build-time AND at send-time in every batch."
      />
      <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
        <ShieldCheck className="h-4 w-4 text-health-good" />
        <span>{total} address{total === 1 ? "" : "es"} on the suppression list.</span>
      </div>
      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Note</th>
              <th className="px-4 py-3 text-left">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr><td className="px-4 py-6 text-white/60" colSpan={4}>No suppressions yet.</td></tr>
            )}
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={s.reason === "UNSUBSCRIBE" ? "tag-warn" : s.reason === "BOUNCE" ? "tag-bad" : s.reason === "COMPLAINT" ? "tag-bad" : "tag"}>
                    {s.reason.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/70">{s.note ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">{s.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
