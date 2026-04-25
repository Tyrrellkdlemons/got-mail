import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const campaigns = workspace
    ? await prisma.campaign.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        include: { segment: true, sendingIdentity: true, _count: { select: { recipients: true } } },
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ campaign builder"
        title="Craft a compliant campaign."
        subtitle="Subject, preview, HTML, plain text, required footer, required unsubscribe. Spam-risk warnings before you send."
        actions={
          <>
            <Link href="/campaigns/new" className="btn-primary">
              New campaign
            </Link>
            <Link href="/test-send" className="btn-secondary">
              Send a test batch (5)
            </Link>
          </>
        }
      />
      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Segment</th>
              <th className="px-4 py-3 text-left">Recipients</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={6}>
                  No campaigns yet. Click <span className="text-envelope-500">New campaign</span> or seed sample data with{" "}
                  <code className="font-mono">SEED_DATABASE.bat</code>.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-white/70">{c.subject}</td>
                <td className="px-4 py-3 text-white/60">{c.segment?.name ?? "—"}</td>
                <td className="px-4 py-3 font-mono">{c._count.recipients}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      c.status === "DRAFT"
                        ? "tag"
                        : c.status === "SENDING"
                        ? "tag-clue"
                        : c.status === "COMPLETED"
                        ? "tag-good"
                        : c.status === "FAILED" || c.status === "CANCELED"
                        ? "tag-bad"
                        : "tag-warn"
                    }
                  >
                    {c.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">
                  {c.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
