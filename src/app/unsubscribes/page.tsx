import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function UnsubscribesPage() {
  return (
    <PlaceholderPage
      eyebrow="★ unsubscribes"
      title="Respected. Always."
      subtitle="One-click unsubscribe header supported (Gmail/Yahoo 2024 requirement for senders >5k/day). In-body link works too."
      bullets={[
        "Unique token per recipient per campaign",
        "Unsub endpoint validates the signed token before honoring",
        "Confirmation page shows which campaign they unsubscribed from",
        "Preference center (optional): topics, frequency, global unsub",
      ]}
    />
  );
}
