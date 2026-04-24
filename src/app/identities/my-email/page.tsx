import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function MyEmailSmtp() {
  return (
    <PlaceholderPage
      eyebrow="★ sending mode · my email"
      title="Send from my email / SMTP"
      subtitle="Connect Gmail, Google Workspace, Outlook, Zoho, or any business SMTP account."
      warn="Personal email accounts aren't ideal for 1,000+ campaigns. Free Gmail tops out around 500/day; Google Workspace is 2,000/day per user. Got Mail enforces these caps."
      bullets={[
        "SMTP host, port, username, password/app password",
        "From name + From email + Reply-to",
        "Daily & hourly limits stored per-account and enforced by the queue",
        "Warmup status tracked per identity",
        "Not for cold outreach — for your existing business contacts only",
      ]}
      ctaHref="/provider-setup"
      ctaLabel="Open SMTP connection form"
    />
  );
}
