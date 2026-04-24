import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { prisma } from "@/lib/db";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const RAMP = [50, 100, 200, 400, 800, 1500, 3000, 5000, 8000, 15000];

export default async function WarmupPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const schedules = workspace
    ? await prisma.warmupSchedule.findMany({
        where: { workspaceId: workspace.id },
        include: { sendingIdentity: true },
        orderBy: { startedAt: "desc" },
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ warmup autopilot"
        title="Build sender reputation from zero."
        subtitle="New domain or IP? Ramp from 50 to 15,000/day over 10 days — engaged-first, business-hours-only."
      />

      <div className="panel mb-6 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-xl text-clue-400">
          <Sparkles className="h-5 w-5 text-envelope-500" /> The 10-day ramp
        </h3>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
          {RAMP.map((cap, i) => (
            <div key={i} className="rounded-chunky border border-white/10 bg-white/5 p-3 text-center">
              <div className="font-retro text-[9px] uppercase tracking-widest text-envelope-500">Day {i + 1}</div>
              <div className="mt-1 font-display text-lg">{cap.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <Section title="Active warmup schedules">
        {schedules.length === 0 && (
          <div className="panel p-6 text-white/60">
            No warmups in progress. When you create a new Sending Identity for a fresh domain, Got Mail
            will automatically spin up a warmup schedule.
          </div>
        )}
        <div className="space-y-3">
          {schedules.map((s) => {
            const pct = (s.day / RAMP.length) * 100;
            return (
              <div key={s.id} className="panel p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.sendingIdentity.name}</div>
                    <div className="font-mono text-xs text-white/60">{s.sendingIdentity.fromEmail}</div>
                  </div>
                  <span className={s.status === "IN_PROGRESS" ? "tag-clue" : s.status === "COMPLETED" ? "tag-good" : "tag-warn"}>
                    {s.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                <ProgressBar value={s.day} max={RAMP.length} label={`Day ${s.day} / 10 · cap ${s.dailyCap.toLocaleString()}/day`} tone="envelope" />
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
