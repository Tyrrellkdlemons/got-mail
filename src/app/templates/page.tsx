import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const templates = workspace
    ? await prisma.emailTemplate.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ templates"
        title="Reusable email templates."
        subtitle="Use MJML or React Email. Every template auto-includes a compliant footer with unsubscribe token and physical address."
      />
      <div className="space-y-3">
        {templates.length === 0 && (
          <div className="panel p-6 text-white/60">No templates yet.</div>
        )}
        {templates.map((t) => (
          <div key={t.id} className="panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="font-display text-xl">{t.name}</div>
                <div className="font-mono text-xs text-white/60">{t.id}</div>
              </div>
              <div className="text-xs text-white/50">{t.createdAt.toISOString().slice(0, 10)}</div>
            </div>
            <div className="mb-2 text-sm">
              <span className="font-retro text-[10px] uppercase text-envelope-500">Subject:</span>{" "}
              {t.subject}
            </div>
            {t.preheader && (
              <div className="mb-2 text-sm text-white/70">
                <span className="font-retro text-[10px] uppercase text-envelope-500">Preheader:</span>{" "}
                {t.preheader}
              </div>
            )}
            <details>
              <summary className="cursor-pointer text-xs text-white/60 hover:text-white">
                View HTML / Plain text
              </summary>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <pre className="max-h-60 overflow-auto rounded-lg bg-aol-900/60 p-3 text-xs text-white/80">
                  {t.html}
                </pre>
                <pre className="max-h-60 overflow-auto rounded-lg bg-aol-900/60 p-3 text-xs text-white/80">
                  {t.text}
                </pre>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
