import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function TemplatesPage() {
  return (
    <PlaceholderPage
      eyebrow="★ templates"
      title="Reusable email templates."
      subtitle="MJML + React Email. Mobile-tested. Includes a safe, compliant default footer you can't remove."
      bullets={[
        "Default footer with physical address + {{unsubscribe_url}} token",
        "React Email components available in the editor",
        "Per-template variables (first_name, last_name, email, custom fields)",
        "Inline CSS compiled on save for maximum deliverability",
      ]}
    />
  );
}
