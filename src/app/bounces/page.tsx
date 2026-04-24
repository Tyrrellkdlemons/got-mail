import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function BouncesPage() {
  return (
    <PlaceholderPage
      eyebrow="★ bounces & complaints"
      title="The naughty list."
      subtitle="Hard bounces, soft bounces, spam complaints. Auto-suppressed on arrival."
      bullets={[
        "Hard bounce → Suppression row, never contacted again",
        "Soft bounce → retry with exponential backoff; 3 strikes and out",
        "Spam complaint → Suppression + Complaint row + optional workspace alert",
        "Bulk actions: export, investigate, manually resurrect a false-positive",
      ]}
    />
  );
}
