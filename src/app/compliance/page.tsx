import { PageHeader } from "@/components/ui/PageHeader";
import { Check, X } from "lucide-react";

const CHECKLIST: { id: string; label: string; group: string; blocker: boolean }[] = [
  { group: "Sender", id: "name", label: "Legal business name", blocker: true },
  { group: "Sender", id: "address", label: "Valid physical/postal address", blocker: true },
  { group: "Sender", id: "reply", label: "Monitored reply-to", blocker: true },
  { group: "Domain", id: "spf", label: "SPF published and passing", blocker: true },
  { group: "Domain", id: "dkim", label: "DKIM published and passing", blocker: true },
  { group: "Domain", id: "dmarc", label: "DMARC published (p=none minimum)", blocker: true },
  { group: "Domain", id: "return", label: "Return-path aligned", blocker: true },
  { group: "Content", id: "subject", label: "Subject not deceptive", blocker: true },
  { group: "Content", id: "text", label: "Plain-text alternative present", blocker: true },
  { group: "Content", id: "unsub", label: "Unsubscribe link + List-Unsubscribe header", blocker: true },
  { group: "Content", id: "oneclick", label: "One-click unsubscribe (Gmail/Yahoo >5k/day)", blocker: true },
  { group: "Content", id: "addr", label: "Physical address in footer", blocker: true },
  { group: "Audience", id: "consent", label: "All recipients consent-verified", blocker: true },
  { group: "Audience", id: "supp", label: "Suppression list checked", blocker: true },
  { group: "Sending", id: "quota", label: "Provider quota available or queued", blocker: true },
  { group: "Sending", id: "bounce", label: "Bounce rate <2%", blocker: false },
  { group: "Sending", id: "complaint", label: "Complaint rate <0.1%", blocker: false },
];

export default function CompliancePage() {
  const groups = Array.from(new Set(CHECKLIST.map((c) => c.group)));
  return (
    <div>
      <PageHeader
        eyebrow="★ compliance checklist"
        title="What every campaign must satisfy."
        subtitle="CAN-SPAM + GDPR + CASL + Gmail/Yahoo 2024. Got Mail blocks sends when a blocker fails; warnings surface but don't block."
      />
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g} className="panel p-5">
            <h3 className="mb-3 font-display text-2xl text-clue-400">{g}</h3>
            <ul className="space-y-2">
              {CHECKLIST.filter((c) => c.group === g).map((c) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  {c.blocker ? (
                    <Check className="h-4 w-4 text-health-good" />
                  ) : (
                    <X className="h-4 w-4 text-health-warn" />
                  )}
                  <span className={c.blocker ? "text-white" : "text-white/70"}>
                    {c.label}
                  </span>
                  <span
                    className={
                      c.blocker ? "tag-bad" : "tag-warn"
                    }
                  >
                    {c.blocker ? "blocker" : "warning"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
