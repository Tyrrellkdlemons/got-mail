import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "provider", label: "Providers" },
  { key: "oss_newsletter", label: "OSS newsletter" },
  { key: "mail_server", label: "Mail servers" },
  { key: "dns_tool", label: "DNS tools" },
  { key: "spam_tool", label: "Spam & inbox tests" },
  { key: "template_lib", label: "Templates" },
  { key: "free_domain", label: "Free domains" },
];

export default async function SourcesPage() {
  const items = await prisma.sourceResearchItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  }).catch(() => []);

  const grouped: Record<string, typeof items> = {};
  for (const it of items) {
    grouped[it.category] = grouped[it.category] ?? [];
    grouped[it.category].push(it);
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ free source finder"
        title="The research desk."
        subtitle="Every free or low-cost email tool we've catalogued — providers, open-source stacks, DNS tools, spam checkers, templates, and free domains."
      />

      {CATEGORIES.map((cat) => {
        const list = grouped[cat.key] ?? [];
        if (!list.length) return null;
        return (
          <section key={cat.key} className="mb-8">
            <h2 className="mb-3 font-display text-2xl text-clue-400">
              {cat.label}{" "}
              <span className="font-mono text-sm text-white/40">
                ({list.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.map((it) => (
                <div key={it.id} className="panel p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-white">{it.name}</div>
                    <span
                      className={
                        it.status === "verified"
                          ? "tag-good"
                          : it.status === "trial_only"
                          ? "tag-warn"
                          : it.status === "experimental"
                          ? "tag-warn"
                          : "tag"
                      }
                    >
                      {it.status}
                    </span>
                  </div>
                  {it.description && (
                    <p className="mt-1 text-sm text-white/70">{it.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {it.freeLimit && <span className="tag-env">{it.freeLimit}</span>}
                    {it.license && <span className="tag">{it.license}</span>}
                    {it.selfHosted && <span className="tag-clue">self-hosted</span>}
                    {it.supportsBulk && <span className="tag">bulk-safe</span>}
                  </div>
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
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="panel p-6 text-white/70">
          Run <code className="font-mono">npm run db:seed</code> to populate the
          research database.
        </div>
      )}
    </div>
  );
}
