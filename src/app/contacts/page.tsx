import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";

export default function ContactsPage() {
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
        the full list. Attach the selection to a campaign and the sending
        engine takes it from there.
      </Warning>
      <div className="mt-6 panel p-6 text-center text-white/60">
        No contacts yet. Import a CSV or add one manually.
      </div>
    </div>
  );
}
