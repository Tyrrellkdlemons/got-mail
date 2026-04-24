import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { prisma } from "@/lib/db";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OpenSourcePage() {
  const items = await prisma.sourceResearchItem.findMany({
    where: { category: { in: ["oss_newsletter", "mail_server"] } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  }).catch(() => []);

  const newsletters = items.filter((i) => i.category === "oss_newsletter");
  const servers = items.filter((i) => i.category === "mail_server");

  return (
    <div>
      <PageHeader
        eyebrow="★ open-source tools"
        title="Self-host it yourself."
        subtitle="Newsletter managers, marketing automation, and full-stack mail servers you can run on your own infrastructure."
      />
      <div className="mb-6">
        <Warning title="Self-hosting ≠ unlimited trusted sending">
          Open-source tools can manage large campaigns, but inbox delivery still
          depends on DNS, domain reputation, IP reputation, bounce rate,
          complaint rate, recipient consent, and compliance.
        </Warning>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-2xl text-clue-400">
          Newsletter & marketing automation
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {newsletters.map((it) => (
            <ToolCard key={it.id} item={it} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl text-clue-400">
          Mail servers & SMTP stacks
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((it) => (
            <ToolCard key={it.id} item={it} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ToolCard({ item }: { item: any }) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between">
        <div className="font-semibold text-white">{item.name}</div>
        {item.license && <span className="tag">{item.license}</span>}
      </div>
      {item.description && (
        <p className="mt-1 text-sm text-white/70">{item.description}</p>
      )}
      {item.officialUrl && (
        <a
          href={item.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-clue-400 hover:underline"
        >
          {item.officialUrl} <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
