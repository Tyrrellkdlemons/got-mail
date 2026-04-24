"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Envelope } from "@/components/brand/Envelope";
import { PawStripe } from "@/components/brand/PawStripe";
import { YouveGotMailToast } from "@/components/brand/YouveGotMailToast";
import {
  LayoutDashboard,
  Search,
  Boxes,
  Globe2,
  ShieldCheck,
  Users2,
  Tags,
  PencilRuler,
  Inbox,
  Gauge,
  AlertTriangle,
  ListChecks,
  Settings,
  KeyRound,
  Server,
  Mailbox,
  Network,
  Sparkles,
  Rocket,
  FlaskConical,
  History,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
  badge?: string;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Home" },

  { href: "/providers", label: "Provider Finder", icon: Search, section: "Discover" },
  { href: "/sources", label: "Free Source Finder", icon: Boxes, section: "Discover" },
  { href: "/open-source", label: "Open-Source Tools", icon: Server, section: "Discover" },
  { href: "/free-domains", label: "Free Domains", icon: Globe2, section: "Discover", badge: "exp" },

  { href: "/domain-wizard", label: "Domain Wizard", icon: ShieldCheck, section: "Setup" },
  { href: "/identities/my-email", label: "My Email SMTP", icon: Mailbox, section: "Setup" },
  { href: "/identities/owned-domain", label: "Owned Domain", icon: Network, section: "Setup" },
  { href: "/identities/free-domain", label: "Free Subdomain", icon: Globe2, section: "Setup", badge: "exp" },
  { href: "/provider-setup", label: "Provider API Keys", icon: KeyRound, section: "Setup" },

  { href: "/contacts", label: "Contacts", icon: Users2, section: "Audience" },
  { href: "/segments", label: "Segments", icon: Tags, section: "Audience" },
  { href: "/consent", label: "Consent Ledger", icon: History, section: "Audience", badge: "pro" },

  { href: "/campaigns", label: "Campaign Builder", icon: PencilRuler, section: "Send" },
  { href: "/templates", label: "Templates", icon: Inbox, section: "Send" },
  { href: "/mass-mode", label: "1,000+ Mass Mode", icon: Rocket, section: "Send" },
  { href: "/queue", label: "Sending Queue", icon: Gauge, section: "Send" },

  { href: "/deliverability", label: "Deliverability", icon: Gauge, section: "Health" },
  { href: "/dns-health", label: "DNS Health", icon: Network, section: "Health" },
  { href: "/bounces", label: "Bounces & Complaints", icon: AlertTriangle, section: "Health" },
  { href: "/suppression", label: "Suppression", icon: ShieldCheck, section: "Health" },
  { href: "/unsubscribes", label: "Unsubscribes", icon: Inbox, section: "Health" },
  { href: "/compliance", label: "Compliance Checklist", icon: ListChecks, section: "Health" },
  { href: "/doctor", label: "Deliverability Doctor", icon: FlaskConical, section: "Health", badge: "pro" },
  { href: "/warmup", label: "Warmup Autopilot", icon: Sparkles, section: "Health", badge: "pro" },

  { href: "/settings", label: "Settings", icon: Settings, section: "Admin" },
];

const SECTIONS = ["Home", "Discover", "Setup", "Audience", "Send", "Health", "Admin"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <main className="relative min-h-screen">
        <YouveGotMailToast />
        {children}
      </main>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <PawStripe />
      <YouveGotMailToast />

      {/* Sidebar */}
      <aside className="sticky top-0 z-20 hidden h-screen w-72 flex-shrink-0 flex-col border-r border-white/10 bg-aol-900/70 backdrop-blur-md lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-white/10 px-5 py-4"
        >
          <Envelope className="h-9 w-9 animate-envelope-bob" />
          <div>
            <div className="font-retro text-[13px] tracking-tight text-envelope-500">
              GOT MAIL
            </div>
            <div className="font-mono text-[11px] text-white/50">
              you've got... ethical email
            </div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map((section) => {
            const items = NAV.filter((n) => n.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section} className="mb-5">
                <div className="mb-1.5 px-2 font-retro text-[9px] uppercase tracking-wider text-clue-400/80">
                  {section}
                </div>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            active ? "nav-pill-active" : "nav-pill",
                            "text-sm"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                item.badge === "pro"
                                  ? "bg-magenta/20 text-magenta"
                                  : "bg-paw/20 text-paw"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 text-[10px] text-white/50">
          <div className="font-retro text-[10px] text-envelope-500">
            CONNECTION: <span className="dialup text-health-good">ONLINE</span>
          </div>
          <div className="mt-1">
            v0.1.0 · Netlify ready · Neon-compatible
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-aol-900/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Envelope className="h-7 w-7" />
        <div className="font-retro text-xs text-envelope-500">GOT MAIL</div>
      </div>

      <main className="flex-1 overflow-x-hidden pt-14 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
