import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function SuppressionPage() {
  return (
    <PlaceholderPage
      eyebrow="★ suppression list"
      title="Never email these people again."
      subtitle="Combined list of unsubscribes, hard bounces, complaints, and manual blocks."
      bullets={[
        "Checked at campaign creation AND at send-time in each batch",
        "Bulk import from prior systems on migration",
        "Cannot be deleted from inside the app — only a workspace owner with audit trail",
        "Exportable as CSV for legal record",
      ]}
    />
  );
}
