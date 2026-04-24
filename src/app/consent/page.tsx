import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function ConsentPage() {
  return (
    <PlaceholderPage
      eyebrow="★ consent ledger · pro"
      title="Tamper-evident consent log."
      subtitle="Every opt-in, double-opt-in confirmation, import attestation, preference change, and unsubscribe is hashed into an append-only ledger."
      bullets={[
        "Hash-chained log: each record references the previous hash — tamper-evident",
        "Export for GDPR / CAN-SPAM / CASL audits",
        "Consent source, timestamp, IP, user agent captured at every event",
        "Data Subject Access Request handler: one click produces the full record for a given email",
      ]}
    />
  );
}
