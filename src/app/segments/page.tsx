import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function SegmentsPage() {
  return (
    <PlaceholderPage
      eyebrow="★ segments"
      title="Slice your audience."
      subtitle="Define dynamic segments. Attach them to campaigns."
      bullets={[
        "Filter by tag, activity, consent source, imported batch, engagement",
        "Dynamic: re-evaluated every time a campaign is built",
        "Static: snapshot of contacts at the moment you save it",
        "Segments CANNOT include unsubscribed / bounced / complained contacts — the engine drops them",
      ]}
    />
  );
}
