import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function ProviderSetupPage() {
  return (
    <PlaceholderPage
      eyebrow="★ provider api keys"
      title="Connect an email provider"
      subtitle="Paste API keys for Brevo, Mailjet, Resend, Postmark, SendGrid, SES, Postal, listmonk, Mautic, or a generic SMTP account."
      bullets={[
        "Secrets encrypted at rest with CREDENTIALS_ENCRYPTION_KEY",
        "Never exposed to the browser — server-only",
        "Click Validate to hit each provider's /account endpoint and confirm",
        "Per-provider daily/monthly quotas tracked in the database",
        "Webhooks: Got Mail generates the endpoint URL + signing secret for you",
      ]}
      warn="Keys live in your .env for local dev, and in Netlify's environment variables for production. Never paste a real key into a shared document."
    />
  );
}
