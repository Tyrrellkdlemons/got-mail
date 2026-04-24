import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-health-good"
      : tone === "warn"
      ? "text-health-warn"
      : tone === "bad"
      ? "text-health-bad"
      : "text-envelope-500";
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div className="font-retro text-[10px] uppercase tracking-widest text-white/60">
          {label}
        </div>
        {icon && (
          <div className={cn("h-5 w-5", toneClass)}>{icon}</div>
        )}
      </div>
      <div className={cn("mt-3 font-display text-4xl", toneClass)}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-white/60">{sub}</div>}
    </div>
  );
}
