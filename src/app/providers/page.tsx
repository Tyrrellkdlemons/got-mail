import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const items = await prisma.sourceResearchItem.findMany({
    where: { category: "provider" },
    orderBy: { name: "asc" },
  }).catch(() => []);

  return (
    <div>
      <PageHeader
        eyebrow="★ provider finder"
        title="Free & low-cost email providers."
        subtitle="Seed data is verified against official sources. Every entry is re-checked and tagged — we never promise unlimited."
      />
      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Free limit</th>
              <th className="px-4 py-3 text-left">SMTP</th>
              <th className="px-4 py-3 text-left">API</th>
              <th className="px-4 py-3 text-left">Marketing</th>
              <th className="px-4 py-3 text-left">Trans.</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={8}>
                  Run <code className="font-mono">npm run db:seed</code> to populate providers.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-white/80">{p.freeLimit ?? "—"}</td>
                <td className="px-4 py-3">{p.supportsSmtp ? "✓" : "—"}</td>
                <td className="px-4 py-3">{p.supportsApi ? "✓" : "—"}</td>
                <td className="px-4 py-3">{p.supportsMarketing ? "✓" : "—"}</td>
                <td className="px-4 py-3">{p.supportsTransactional ? "✓" : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.status === "verified"
                        ? "tag-good"
                        : p.status === "trial_only"
                        ? "tag-warn"
                        : "tag"
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.officialUrl && (
                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-clue-400 hover:underline"
                    >
                      site <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
