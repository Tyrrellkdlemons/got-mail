import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function DoctorPage() {
  return (
    <PlaceholderPage
      eyebrow="★ deliverability doctor · pro"
      title="Why aren't my emails landing?"
      subtitle="Diagnostics across Gmail, Yahoo, Outlook, blacklists, and DMARC reports."
      bullets={[
        "Inbox placement tests across major providers (seed-inbox methodology)",
        "Blacklist monitoring (Spamhaus, Barracuda, SORBS, and 30+ RBLs)",
        "DMARC report (rua) parser — human-readable: which 3rd party is sending as you?",
        "Google Postmaster Tools integration",
        "Remediation suggestions ranked by impact",
        "24/7 alerting on reputation dips",
      ]}
      warn="Premium feature — flagged via FEATURE_DELIVERABILITY_DOCTOR in .env."
    />
  );
}
