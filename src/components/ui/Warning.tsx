import { AlertTriangle } from "lucide-react";

export function Warning({
  title,
  children,
  tone = "warn",
}: {
  title: string;
  children?: React.ReactNode;
  tone?: "warn" | "bad" | "info";
}) {
  const bg =
    tone === "bad"
      ? "border-health-bad/40 bg-health-bad/10"
      : tone === "info"
      ? "border-clue-500/40 bg-clue-500/10"
      : "border-health-warn/40 bg-health-warn/10";
  const color =
    tone === "bad"
      ? "text-health-bad"
      : tone === "info"
      ? "text-clue-400"
      : "text-health-warn";
  return (
    <div className={`rounded-chunky border p-4 ${bg}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} />
        <div>
          <div className={`font-semibold ${color}`}>{title}</div>
          {children && (
            <div className="mt-1 text-sm text-white/80">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
