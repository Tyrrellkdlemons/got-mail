import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { prisma } from "@/lib/db";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FreeDomainsPage() {
  const items = await prisma.sourceResearchItem.findMany({
    where: { category: "free_domain" },
    orderBy: { name: "asc" },
  }).catch(() => []);

  return (
    <div>
      <PageHeader
        eyebrow="★ free domains · experimental"
        title="Free domain & subdomain research."
        subtitle="Use these for testing only. For serious mass email, buy a real owned domain."
      />
      <div className="mb-6">
        <Warning title="Experimental / low-trust" tone="bad">
          Free domains/subdomains may work for testing, but they are not ideal
          for trusted mass email. Inbox providers score them lower by default.
        </Warning>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.id} className="panel p-4">
            <div className="flex items-start justify-between">
              <div className="font-semibold">{it.name}</div>
              <span
                className={
                  it.riskLevel === "high"
                    ? "tag-bad"
                    : it.riskLevel === "medium"
                    ? "tag-warn"
                    : "tag"
                }
              >
                risk: {it.riskLevel ?? "n/a"}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/70">{it.description}</p>
            {it.notes && <p className="mt-1 text-xs text-white/50">{it.notes}</p>}
            {it.officialUrl && (
              <a
                href={it.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-clue-400 hover:underline"
              >
                {it.officialUrl} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
