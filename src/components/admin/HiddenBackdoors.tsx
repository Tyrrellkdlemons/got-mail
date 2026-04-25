"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hidden admin backdoors. See BACKDOORS.md for the human-readable spec.
 *
 * Backdoor #1 — KONAMI CODE
 *   Type the Konami sequence (↑ ↑ ↓ ↓ ← → ← → b a) anywhere on the home page.
 *   Triggers a redirect to /__admin/login.
 *
 * Backdoor #2 — TYPE THE SECRET WORD
 *   Type the literal word "gotmail" (no shifts, no spaces) anywhere on the page
 *   within a 3-second window. Triggers redirect to /__admin/login.
 *
 * Backdoor #3 — LOGO 7-CLICK
 *   Click any element with data-backdoor="logo" 7 times within 3 seconds.
 *
 * The token URL backdoor (#3 in BACKDOORS.md as well) doesn't need any JS —
 * just visit /__admin/login?backdoor=<token>. Handled by the login page.
 *
 * NOTE: All three backdoors only get you to the LOGIN screen. You still
 * have to know the ADMIN_TOKEN to actually log in. Keep that secret in env.
 */

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function HiddenBackdoors() {
  const [flash, setFlash] = useState<string | null>(null);
  const konamiBuffer = useRef<string[]>([]);
  const wordBuffer = useRef<string>("");
  const wordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimes = useRef<number[]>([]);

  useEffect(() => {
    function showFlash(label: string) {
      setFlash(label);
      setTimeout(() => {
        window.location.href = "/__admin/login";
      }, 600);
    }

    function onKey(e: KeyboardEvent) {
      // Skip if user is typing in an input/textarea
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      // Backdoor #1: Konami code
      konamiBuffer.current.push(e.key);
      if (konamiBuffer.current.length > KONAMI.length) {
        konamiBuffer.current.shift();
      }
      if (konamiBuffer.current.length === KONAMI.length && konamiBuffer.current.every((k, i) => k === KONAMI[i])) {
        konamiBuffer.current = [];
        showFlash("↑↑↓↓←→←→ba — admin gateway");
        return;
      }

      // Backdoor #2: type "gotmail" within 3s
      if (e.key.length === 1) {
        wordBuffer.current += e.key.toLowerCase();
        if (wordTimer.current) clearTimeout(wordTimer.current);
        wordTimer.current = setTimeout(() => { wordBuffer.current = ""; }, 3000);
        if (wordBuffer.current.endsWith("gotmail")) {
          wordBuffer.current = "";
          showFlash('"gotmail" — admin gateway');
        }
      }
    }

    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const trigger = t.closest('[data-backdoor="logo"]');
      if (!trigger) return;
      // Backdoor #3: 7 clicks on logo within 3s
      const now = Date.now();
      clickTimes.current = clickTimes.current.filter((t) => now - t < 3000);
      clickTimes.current.push(now);
      if (clickTimes.current.length >= 7) {
        clickTimes.current = [];
        showFlash("logo×7 — admin gateway");
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (!flash) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[200] rounded-chunky border-2 border-envelope-500 bg-aol-900 px-4 py-3 text-left shadow-pop">
      <div className="font-retro text-[10px] uppercase tracking-widest text-envelope-500">★ admin gateway opening</div>
      <div className="mt-1 font-display text-base text-white">{flash}</div>
    </div>
  );
}
