import { cn } from "@/lib/utils";

/** Iconic yellow AOL envelope. */
export function Envelope({
  className,
  withFlag = true,
}: {
  className?: string;
  withFlag?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="env-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE15A" />
          <stop offset="1" stopColor="#E6BE00" />
        </linearGradient>
        <linearGradient id="env-flap" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFF59F" />
          <stop offset="1" stopColor="#FFD500" />
        </linearGradient>
      </defs>

      {/* body */}
      <rect x="6" y="18" width="52" height="34" rx="3" fill="url(#env-body)" stroke="#000" strokeWidth="2" />

      {/* flap */}
      <polygon
        points="6,18 58,18 32,38"
        fill="url(#env-flap)"
        stroke="#000"
        strokeWidth="2"
      />

      {/* folds */}
      <line x1="6" y1="52" x2="28" y2="34" stroke="#000" strokeWidth="1.5" />
      <line x1="58" y1="52" x2="36" y2="34" stroke="#000" strokeWidth="1.5" />

      {/* red flag (AOL style) */}
      {withFlag && (
        <>
          <rect
            x="42"
            y="6"
            width="4"
            height="22"
            fill="#111"
          />
          <polygon
            points="46,6 58,10 46,14"
            fill="#E63946"
            stroke="#111"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}
