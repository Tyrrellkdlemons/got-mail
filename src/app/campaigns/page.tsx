import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ campaign builder"
        title="Craft a compliant campaign."
        subtitle="Subject, preview, HTML, plain text, required footer, required unsubscribe. Spam-risk warnings before you send."
        actions={
          <Link href="/campaigns/new" className="btn-primary">
            New campaign
          </Link>
        }
      />
      <div className="panel p-6 text-white/70">
        No campaigns yet. Click <span className="text-envelope-500">New campaign</span> to start. The
        builder auto-injects the required physical-address footer and{" "}
        <code className="font-mono">{"{{unsubscribe_url}}"}</code> token — you cannot remove them.
      </div>
    </div>
  );
}
