export function ProgressBar({
  value,
  max = 100,
  tone = "clue",
  label,
}: {
  value: number;
  max?: number;
  tone?: "clue" | "envelope" | "good" | "warn" | "bad";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    tone === "envelope"
      ? "bg-envelope-500"
      : tone === "good"
      ? "bg-health-good"
      : tone === "warn"
      ? "bg-health-warn"
      : tone === "bad"
      ? "bg-health-bad"
      : "bg-clue-500";
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs text-white/70">
          <span>{label}</span>
          <span className="font-mono">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color} shadow-glow transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
