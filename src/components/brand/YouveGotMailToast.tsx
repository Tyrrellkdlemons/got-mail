"use client";

import { useEffect, useState } from "react";
import { Envelope } from "./Envelope";

/**
 * The iconic "You've got mail!" pop-up.
 * Shows on first load, fades out on click or after 5s.
 * Mostly decorative — hooks into real notification events later.
 */
export function YouveGotMailToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen =
      typeof window !== "undefined" &&
      sessionStorage.getItem("gm-greeting-seen");
    if (seen) return;
    const t = setTimeout(() => setShow(true), 800);
    const t2 = setTimeout(() => setShow(false), 6000);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gm-greeting-seen", "1");
    }
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => setShow(false)}
      aria-label="Dismiss greeting"
      className="fixed right-4 top-4 z-50 animate-got-mail-pop rounded-chunky border-2 border-envelope-500 bg-aol-800 px-4 py-3 text-left shadow-pop"
    >
      <div className="flex items-center gap-3">
        <Envelope className="h-10 w-10 animate-envelope-bob" />
        <div>
          <div className="font-retro text-[11px] uppercase text-envelope-500">
            You've got mail!
          </div>
          <div className="font-mono text-xs text-white/80">
            Welcome to Got Mail. Click to dismiss.
          </div>
        </div>
      </div>
    </button>
  );
}
