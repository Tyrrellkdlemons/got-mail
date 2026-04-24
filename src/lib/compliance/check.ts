/**
 * Got Mail — Compliance gate.
 * Every campaign must pass these before Send is unlocked.
 */

import { z } from "zod";

export type ComplianceContext = {
  subject: string;
  html: string;
  text: string;
  senderName: string;
  senderEmail: string;
  workspaceLegalName?: string;
  workspacePostalAddress?: string;
  unsubscribeToken?: string;
  domainVerified: boolean;
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  providerQuotaAvailable: boolean;
  recipientCount: number;
  recipientsAllConsentVerified: boolean;
  suppressionChecked: boolean;
  bounceRatePct: number | null;
  complaintRatePct: number | null;
};

export type CheckResult = {
  id: string;
  label: string;
  pass: boolean;
  severity: "blocker" | "warning";
  fix?: string;
};

export function checkCompliance(ctx: ComplianceContext): CheckResult[] {
  const checks: CheckResult[] = [];

  const push = (c: CheckResult) => checks.push(c);

  push({
    id: "sender.name",
    label: "Legal business name set",
    pass: !!ctx.workspaceLegalName,
    severity: "blocker",
    fix: "Workspace → Settings → Legal business name.",
  });
  push({
    id: "sender.address",
    label: "Physical/postal address set",
    pass: !!ctx.workspacePostalAddress && ctx.workspacePostalAddress.length > 5,
    severity: "blocker",
    fix: "Workspace → Settings → Postal address (CAN-SPAM requires this).",
  });
  push({
    id: "sender.from",
    label: "From email is a valid address",
    pass: /@/.test(ctx.senderEmail),
    severity: "blocker",
  });
  push({
    id: "domain.verified",
    label: "Sender domain verified",
    pass: ctx.domainVerified,
    severity: "blocker",
    fix: "Run the Domain Setup Wizard.",
  });
  push({
    id: "domain.spf",
    label: "SPF passing",
    pass: ctx.spfValid,
    severity: "blocker",
    fix: "Publish SPF TXT with your provider's include.",
  });
  push({
    id: "domain.dkim",
    label: "DKIM passing",
    pass: ctx.dkimValid,
    severity: "blocker",
    fix: "Publish DKIM records from your provider.",
  });
  push({
    id: "domain.dmarc",
    label: "DMARC published",
    pass: ctx.dmarcValid,
    severity: "warning",
    fix: "Publish _dmarc TXT — start with p=none for ramp.",
  });
  push({
    id: "content.subject",
    label: "Subject line not deceptive",
    pass: !isDeceptiveSubject(ctx.subject),
    severity: "blocker",
    fix: "Avoid \"RE:\", \"FWD:\", ALL CAPS, urgency spam.",
  });
  push({
    id: "content.text",
    label: "Plain-text alternative present",
    pass: (ctx.text?.trim().length ?? 0) > 0,
    severity: "blocker",
    fix: "Add a plain-text version (most builders auto-generate).",
  });
  push({
    id: "content.unsubscribe",
    label: "Unsubscribe link in body",
    pass: hasUnsubscribeLink(ctx.html, ctx.unsubscribeToken),
    severity: "blocker",
    fix: "Insert {{unsubscribe_url}} in the footer (Got Mail adds it automatically).",
  });
  push({
    id: "content.physical-address",
    label: "Physical address in footer",
    pass:
      ctx.html.toLowerCase().includes((ctx.workspacePostalAddress ?? "").toLowerCase()) &&
      (ctx.workspacePostalAddress?.length ?? 0) > 5,
    severity: "blocker",
    fix: "Include the workspace address in the email footer.",
  });
  push({
    id: "audience.consent",
    label: "All recipients consent-verified",
    pass: ctx.recipientsAllConsentVerified,
    severity: "blocker",
    fix: "Drop non-consenting recipients or confirm import had proof.",
  });
  push({
    id: "audience.suppression",
    label: "Suppression / unsub / bounce list checked",
    pass: ctx.suppressionChecked,
    severity: "blocker",
  });
  push({
    id: "sending.quota",
    label: "Provider quota available (or queueable)",
    pass: ctx.providerQuotaAvailable,
    severity: "blocker",
    fix: "Provider is at its daily/monthly cap — batches will queue.",
  });
  push({
    id: "health.bounce",
    label: "Bounce rate healthy (<2%)",
    pass: ctx.bounceRatePct === null || ctx.bounceRatePct < 2,
    severity: "warning",
  });
  push({
    id: "health.complaint",
    label: "Complaint rate healthy (<0.1%)",
    pass: ctx.complaintRatePct === null || ctx.complaintRatePct < 0.1,
    severity: "warning",
  });

  return checks;
}

export function canSend(results: CheckResult[]): boolean {
  return results.filter((r) => r.severity === "blocker").every((r) => r.pass);
}

function isDeceptiveSubject(s: string): boolean {
  if (!s) return true;
  const lc = s.trim();
  if (/^re:|^fwd?:/i.test(lc)) return true;
  if (lc === lc.toUpperCase() && lc.length > 10) return true;
  if (/free money|click now|act fast|100% guaranteed|viagra/i.test(lc)) return true;
  return false;
}

function hasUnsubscribeLink(html: string, token?: string): boolean {
  if (!html) return false;
  const l = html.toLowerCase();
  if (!l.includes("unsubscribe")) return false;
  // Either raw word is fine for drafts; when token is known, ensure it's present.
  if (token && !l.includes(token.toLowerCase())) return false;
  return true;
}

// Zod for payloads
export const campaignPayload = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  preheader: z.string().optional(),
  html: z.string().min(1),
  text: z.string().min(1),
  segmentId: z.string().optional(),
  sendingIdentityId: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
});
