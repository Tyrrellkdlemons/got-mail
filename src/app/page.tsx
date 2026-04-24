import Link from "next/link";
import { Envelope } from "@/components/brand/Envelope";
import { PawStripe } from "@/components/brand/PawStripe";
import {
  ShieldCheck,
  Globe2,
  Rocket,
  ListChecks,
  Sparkles,
  FlaskConical,
  Server,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe2,
    title: "Provider Finder",
    body: "Live catalog of Brevo, Mailjet, Resend, Postmark, SES and more — with real free limits.",
  },
  {
    icon: Server,
    title: "Open-Source Tools",
    body: "listmonk, Mautic, Postal, Docker Mailserver, Haraka, Stalwart — curated and documented.",
  },
  {
    icon: ShieldCheck,
    title: "Domain Setup Wizard",
    body: "SPF, DKIM, DMARC, return-path, tracking domain — verified before you're allowed to send.",
  },
  {
    icon: Rocket,
    title: "1,000+ Mass Campaign Mode",
    body: "Bulk-select 1,000+ contacts. We batch, throttle, warm up, and auto-pause on bounce/complaint spikes.",
  },
  {
    icon: ListChecks,
    title: "Compliance Gate",
    body: "CAN-SPAM + GDPR + CASL + Gmail/Yahoo 2024 rules enforced before every campaign.",
  },
  {
    icon: Sparkles,
    title: "Warmup Autopilot",
    body: "New domain? We ramp from 50 → 15k/day with engaged-first priority and business-hours spread.",
  },
  {
    icon: FlaskConical,
    title: "Deliverability Doctor",
    body: "Inbox placement tests, blacklist monitoring, DMARC report parser. All-in-one health panel.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <PawStripe />

      {/* Top bar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Envelope className="h-10 w-10 animate-envelope-bob" />
          <div>
            <div className="font-retro text-sm tracking-tight text-envelope-500">
              GOT MAIL
            </div>
            <div className="font-mono text-[10px] text-white/50">
              you've got... ethical email
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/providers" className="text-white/70 hover:text-white">Providers</Link>
          <Link href="/open-source" className="text-white/70 hover:text-white">Open Source</Link>
          <Link href="/compliance" className="text-white/70 hover:text-white">Compliance</Link>
          <Link href="/dashboard" className="btn-primary text-sm">Open app</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <div className="font-retro text-[11px] uppercase tracking-widest text-envelope-500">
            <span className="dialup">connecting</span>
          </div>
          <h1 className="mt-3 font-display text-6xl leading-none text-white sm:text-7xl md:text-8xl">
            Find trusted free email tools.
            <br />
            <span className="text-envelope-500">Send ethically.</span>
            <br />
            <span className="text-clue-400">Protect your domain.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Got Mail helps creators, startups, and small businesses discover
            free & open-source email providers, verify their DNS, and send
            compliance-safe 1,000+ recipient campaigns — without wrecking
            sender reputation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">
              Start with free sources
            </Link>
            <Link href="/domain-wizard" className="btn-secondary">
              Check my email setup
            </Link>
            <Link href="/mass-mode" className="btn-ghost">
              1,000+ Mass Mode
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <span className="tag-env">AOL-era energy</span>
            <span className="tag-clue">Blue's Clues vibes</span>
            <span className="tag-good">CAN-SPAM safe</span>
            <span className="tag-good">GDPR ready</span>
            <span className="tag-good">Gmail/Yahoo 2024 rules</span>
          </div>
        </div>

        {/* Faux AOL login panel */}
        <div className="panel-retro font-mono text-white">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-retro text-[11px] text-envelope-500">GM 3.0</div>
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-health-bad" />
              <div className="h-2.5 w-2.5 rounded-full bg-health-warn" />
              <div className="h-2.5 w-2.5 rounded-full bg-health-good animate-modem-blink" />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-aol-900/80 p-3">
              <div className="text-envelope-500">Screen Name:</div>
              <div>yourbiz@yourcompany.com</div>
            </div>
            <div className="rounded-lg bg-aol-900/80 p-3">
              <div className="text-envelope-500">Provider:</div>
              <div>Brevo · 300 / day · free</div>
            </div>
            <div className="rounded-lg bg-aol-900/80 p-3">
              <div className="text-envelope-500">Domain:</div>
              <div>
                SPF <span className="text-health-good">✓</span>{" "}
                DKIM <span className="text-health-good">✓</span>{" "}
                DMARC <span className="text-health-good">✓</span>
              </div>
            </div>
            <div className="rounded-lg bg-aol-900/80 p-3">
              <div className="text-envelope-500">Status:</div>
              <div>
                <span className="dialup text-health-good">sending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="relative overflow-hidden border-y border-envelope-500/30 bg-aol-900/60 py-3">
        <div className="marquee-track font-retro text-xs uppercase tracking-widest text-envelope-500">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <span>★ You've got mail.</span>
              <span>★ Brevo · 300/day free</span>
              <span>★ Mailjet · 6,000/month</span>
              <span>★ Resend · 100/day</span>
              <span>★ listmonk · self-host</span>
              <span>★ Mautic · open source</span>
              <span>★ Postal · self-host</span>
              <span>★ Docker Mailserver</span>
              <span>★ SPF · DKIM · DMARC</span>
              <span>★ CAN-SPAM safe</span>
              <span>★ Warmup autopilot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <div className="font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            ★ features
          </div>
          <h2 className="mt-1 font-display text-5xl text-white">
            Everything an ethical sender actually needs.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="panel p-6">
                <Icon className="h-7 w-7 text-envelope-500" />
                <h3 className="mt-3 font-display text-2xl text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/70">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hard rules panel */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="panel p-8">
          <div className="font-retro text-[10px] uppercase tracking-widest text-paw">
            ★ the hard rules
          </div>
          <h2 className="mt-1 font-display text-3xl text-white">
            What Got Mail will never do.
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-white/80 md:grid-cols-2">
            <li>· No "unlimited sending" claims.</li>
            <li>· No provider rotation to evade limits.</li>
            <li>· No scraped or purchased lists.</li>
            <li>· No hidden sender identity.</li>
            <li>· No ignoring unsubscribes.</li>
            <li>· No deceptive subject lines or headers.</li>
            <li>· No sending without SPF/DKIM verified (for owned domain mode).</li>
            <li>· No bypassing Gmail/Yahoo 2024 sender rules.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Envelope className="mx-auto h-20 w-20 animate-envelope-bob" />
        <h2 className="mt-6 font-display text-6xl text-white">
          You've got... <span className="text-envelope-500">mail tools.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">
          Free, ethical, and reputation-safe. Built on top of open-source email
          infrastructure and a compliance engine that blocks unsafe sends before
          they hit the wire.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Sign On
          </Link>
          <Link href="/providers" className="btn-secondary">
            Browse Providers
          </Link>
        </div>
        <div className="mt-6 font-mono text-xs text-white/50">
          Netlify-ready · Neon Postgres · MIT license · v0.1.0
        </div>
      </section>
    </div>
  );
}
