import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { prisma } from "@/lib/db";
import { Gauge, Users2, AlertTriangle, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const [jobs, sentLastHour, queuedBatches, failedLastHour] = workspace
    ? await Promise.all([
        prisma.sendJob.findMany({
          where: { workspaceId: workspace.id },
          include: { campaign: { select: { name: true } }, batches: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        }).catch(() => []),
        prisma.emailSend.count({
          where: {
            workspaceId: workspace.id,
            status: "SENT",
            sentAt: { gte: new Date(Date.now() - 3600 * 1000) },
          },
        }).catch(() => 0),
        prisma.sendingBatch.count({ where: { finishedAt: null } }).catch(() => 0),
        prisma.emailSend.count({
          where: {
            workspaceId: workspace.id,
            status: { in: ["FAILED", "DEFERRED"] },
            sentAt: { gte: new Date(Date.now() - 3600 * 1000) },
          },
        }).catch(() => 0),
      ])
    : [[], 0, 0, 0];

  return (
    <div>
      <PageHeader
        eyebrow="★ sending queue"
        title="Live sending activity."
        subtitle="Per-job progress with batches, throughput, and circuit-breaker state."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Queued batches" value={queuedBatches} icon={<Gauge />} tone={queuedBatches > 0 ? "warn" : "default"} />
        <StatCard label="Sent (1h)" value={sentLastHour} icon={<Users2 />} tone="good" />
        <StatCard label="Failed (1h)" value={failedLastHour} icon={<AlertTriangle />} tone={failedLastHour > 0 ? "bad" : "default"} />
        <StatCard label="Active jobs" value={jobs.filter((j) => j.status === "RUNNING" || j.status === "PENDING").length} icon={<Timer />} />
      </div>

      <Section title="Recent send jobs">
        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="panel p-6 text-white/60">No send jobs yet. Start a campaign — jobs stream here.</div>
          )}
          {jobs.map((j) => {
            const total = j.totalRecipients || 1;
            const done = j.sent + j.failed;
            return (
              <div key={j.id} className="panel p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{j.campaign?.name ?? "(no campaign)"}</div>
                    <div className="font-mono text-xs text-white/50">{j.id}</div>
                  </div>
                  <span
                    className={
                      j.status === "RUNNING"
                        ? "tag-clue"
                        : j.status === "COMPLETED"
                        ? "tag-good"
                        : j.status.startsWith("PAUSED")
                        ? "tag-warn"
                        : j.status === "FAILED" || j.status === "CANCELED"
                        ? "tag-bad"
                        : "tag"
                    }
                  >
                    {j.status.toLowerCase()}
                  </span>
                </div>
                <ProgressBar
                  value={done}
                  max={total}
                  label={`${j.sent} sent · ${j.failed} failed · ${j.bounced} bounced · ${j.totalRecipients} total`}
                  tone={j.status.startsWith("PAUSED") ? "warn" : j.status === "COMPLETED" ? "good" : "clue"}
                />
                {j.pauseReason && (
                  <div className="mt-2 text-xs text-health-warn">Pause reason: {j.pauseReason}</div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
