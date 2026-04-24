import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Gauge, AlertTriangle, Inbox } from "lucide-react";

export default function DeliverabilityPage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ deliverability"
        title="Am I landing in the inbox?"
        subtitle="Rolling 30-day metrics per domain and provider. Spike alerts baked in."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Bounce rate" value="—" sub="target <2%" tone="good" icon={<AlertTriangle />} />
        <StatCard label="Complaint rate" value="—" sub="target <0.1%" tone="good" />
        <StatCard label="Inbox placement" value="—" sub="Gmail/Yahoo/Outlook" tone="good" icon={<Inbox />} />
        <StatCard label="Open rate" value="—" sub="engagement proxy" icon={<Gauge />} />
        <StatCard label="Click rate" value="—" />
        <StatCard label="Unsub rate" value="—" />
      </div>
    </div>
  );
}
