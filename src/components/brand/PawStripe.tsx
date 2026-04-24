"use client";

/** Animated Blue's-Clues-style paw prints walking across the bottom of the screen. */
export function PawStripe() {
  return (
    <div className="pointer-events-none fixed bottom-2 left-0 right-0 z-10 h-8 overflow-hidden opacity-60">
      <div className="flex animate-paw-walk gap-10 pl-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Paw key={i} />
        ))}
      </div>
    </div>
  );
}

function Paw() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="6" cy="9" r="2.2" fill="#00AEEF" />
      <circle cx="11" cy="5.5" r="2.2" fill="#00AEEF" />
      <circle cx="16" cy="5.5" r="2.2" fill="#00AEEF" />
      <circle cx="21" cy="9" r="2.2" fill="#00AEEF" />
      <ellipse cx="13.5" cy="15" rx="6" ry="5" fill="#00AEEF" />
    </svg>
  );
}
