import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function DnsHealthPage() {
  return (
    <PlaceholderPage
      eyebrow="★ dns health"
      title="Live DNS authentication status."
      subtitle="Checks SPF, DKIM, DMARC, MX, return-path, tracking domain every hour. Alerts on drift."
      bullets={[
        "Per-domain panels with current DNS records",
        "SPF flattening / lookup-count warnings",
        "DKIM key rotation reminders",
        "DMARC report ingestion (rua + ruf)",
        "Auto-pause all sending if a critical record disappears",
      ]}
      ctaHref="/domain-wizard"
      ctaLabel="Run the Domain Wizard"
    />
  );
}
