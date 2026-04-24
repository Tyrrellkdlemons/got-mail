import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Gauge, Users2, AlertTriangle, Timer } from "lucide-react";

export default function QueuePage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ sending queue"
        title="Live sending activity."
        subtitle="Per-job progress: sent, queued, failed, bounced, unsubscribed, complained."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Queued" value="0" icon={<Gauge />} />
        <StatCard label="Sent (1h)" value="0" icon={<Users2 />} tone="good" />
        <StatCard label="Failed (1h)" value="0" icon={<AlertTriangle />} tone="warn" />
        <StatCard label="Avg throughput" value="—" sub="emails / min" icon={<Timer />} />
      </div>
      <div className="panel p-6 text-white/60">
        No active send jobs. Start a campaign to see it stream here.
      </div>
    </div>
  );
}
