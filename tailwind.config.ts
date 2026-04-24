import type { Config } from "tailwindcss";

// =====================================================
//   Got Mail — Retro-Modern AOL × Blue's Clues theme
// =====================================================

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Classic AOL blues
        aol: {
          50: "#E6F2FB",
          100: "#C3DFF5",
          200: "#8BC0EB",
          300: "#4FA0E0",
          400: "#1B80D3",
          500: "#0061B0", // signature AOL blue
          600: "#004E8F",
          700: "#003B6D",
          800: "#00284B",
          900: "#001A32",
        },
        // Blue's Clues bright cyan
        clue: {
          400: "#34C6F4",
          500: "#00AEEF", // Blue's signature hue
          600: "#0090C7",
        },
        // AOL running-man yellow envelope
        envelope: {
          400: "#FFE15A",
          500: "#FFD500", // iconic
          600: "#E6BE00",
        },
        // Paw-print red & Magenta-Shaker-pink (Blue's Clues friends)
        paw: "#E63946",
        magenta: "#E63DB2",
        // Health indicators
        health: {
          good: "#22C55E",
          warn: "#F59E0B",
          bad: "#EF4444",
        },
      },
      fontFamily: {
        display: ['"VT323"', "ui-monospace", "SFMono-Regular", "monospace"],
        retro: ['"Press Start 2P"', "ui-monospace", "monospace"],
        body: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // Chunky retro bevel
        bevel:
          "inset 2px 2px 0 0 rgba(255,255,255,0.35), inset -2px -2px 0 0 rgba(0,0,0,0.35), 4px 4px 0 0 rgba(0,0,0,0.35)",
        pop: "0 0 0 3px #FFD500, 0 0 22px rgba(0,174,239,0.6)",
        glow: "0 0 24px rgba(0,174,239,0.45)",
        crt: "inset 0 0 80px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "aol-gradient":
          "linear-gradient(135deg, #001A32 0%, #003B6D 40%, #0061B0 100%)",
        "clue-gradient":
          "linear-gradient(180deg, #00AEEF 0%, #0061B0 100%)",
        scanlines:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 2px, transparent 4px)",
        dotgrid:
          "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      animation: {
        "envelope-bob": "envelopeBob 2.6s ease-in-out infinite",
        "envelope-fly": "envelopeFly 5s linear infinite",
        "dialup-dots": "dialupDots 1.2s steps(4, end) infinite",
        "paw-walk": "pawWalk 3s linear infinite",
        marquee: "marquee 28s linear infinite",
        "crt-flicker": "crtFlicker 5s infinite",
        "modem-blink": "modemBlink 1s steps(2, end) infinite",
        twinkle: "twinkle 1.8s ease-in-out infinite",
        "got-mail-pop": "gotMailPop 0.9s ease-out",
      },
      keyframes: {
        envelopeBob: {
          "0%,100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
        envelopeFly: {
          "0%": { transform: "translateX(-10%) translateY(0)" },
          "50%": { transform: "translateX(50%) translateY(-20px)" },
          "100%": { transform: "translateX(110%) translateY(0)" },
        },
        dialupDots: {
          "0%,100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
        pawWalk: {
          "0%": { transform: "translateX(-100%) rotate(-8deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(120vw) rotate(8deg)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        crtFlicker: {
          "0%,100%": { opacity: "1" },
          "92%": { opacity: "0.92" },
          "94%": { opacity: "0.84" },
          "96%": { opacity: "0.96" },
        },
        modemBlink: {
          "0%": { opacity: "0.2" },
          "100%": { opacity: "1" },
        },
        twinkle: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.15)", opacity: "0.6" },
        },
        gotMailPop: {
          "0%": { transform: "scale(0.5) rotate(-20deg)", opacity: "0" },
          "60%": { transform: "scale(1.15) rotate(6deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      borderRadius: {
        chunky: "18px",
        envelope: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
