import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const records = workspace
    ? await prisma.consentRecord.findMany({
        where: { workspaceId: workspace.id },
        include: { contact: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ consent ledger · tamper-evident"
        title="Hash-chained proof of consent."
        subtitle="Every opt-in, DOI confirmation, import attestation, preference change, and unsubscribe with a SHA-256 proof hash."
      />

      <div className="mb-4">
        <Warning title="Export for audits" tone="info">
          This ledger is your audit trail for GDPR, CAN-SPAM, and CASL. Every record is timestamped
          and hash-chained. A CSV export can be generated from this data at any time.
        </Warning>
      </div>

      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">When</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Event</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Proof hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 && (
              <tr><td className="px-4 py-6 text-white/60" colSpan={6}>No consent records yet.</td></tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-xs">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.contact?.email ?? "—"}</td>
                <td className="px-4 py-3"><span className="tag">{r.event}</span></td>
                <td className="px-4 py-3 text-xs text-white/60">{r.source ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">{r.ip ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-white/50">{r.proofHash?.slice(0, 16) ?? "—"}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
