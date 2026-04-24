import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function OwnedDomainPage() {
  return (
    <PlaceholderPage
      eyebrow="★ sending mode · owned domain · recommended"
      title="Send from my owned domain"
      subtitle="The highest-deliverability sending mode. Requires full DNS authentication."
      bullets={[
        "Connect a domain you own (e.g. yourcompany.com)",
        "Full SPF / DKIM / DMARC verification in the Domain Wizard",
        "Return-path & tracking domain setup",
        "Sender reputation + deliverability dashboard",
        "1,000+ sending unlocked only when all DNS checks pass",
      ]}
      ctaHref="/domain-wizard"
      ctaLabel="Open Domain Wizard"
    />
  );
}
