import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const contacts = workspace
    ? await prisma.contact.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ contacts"
        title="Consent-verified recipients."
        subtitle="Every contact must have consent_status = VERIFIED or IMPORTED_WITH_PROOF before they can receive marketing email."
        actions={
          <>
            <button className="btn-primary">Add contact</button>
            <button className="btn-secondary">Import CSV</button>
          </>
        }
      />
      <Warning title="Bulk select 1,000+ contacts in one click" tone="info">
        Filter by tag, segment, engagement. Tick &ldquo;Select all N matching contacts&rdquo;.
        Got Mail uses a server-side selection token so your browser never holds
        the full list.
      </Warning>
      <div className="mt-6 overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Consent</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contacts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={5}>
                  No contacts yet. Run <code className="font-mono">SEED_DATABASE.bat</code> to add sample contacts, or import a CSV.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono">{c.email}</td>
                <td className="px-4 py-3">
                  {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      c.consentStatus === "VERIFIED" || c.consentStatus === "IMPORTED_WITH_PROOF"
                        ? "tag-good"
                        : c.consentStatus === "UNSUBSCRIBED" || c.consentStatus === "BOUNCED" || c.consentStatus === "COMPLAINED"
                        ? "tag-bad"
                        : "tag-warn"
                    }
                  >
                    {c.consentStatus.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">{c.consentSource ?? "—"}</td>
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
