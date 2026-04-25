// Per-provider webhook parsers. Returns normalized WebhookEvent[].
import type { WebhookEvent } from "./types";

type Parser = (body: any, headers: Headers) => WebhookEvent[];

// ----- Resend -----
// https://resend.com/docs/dashboard/webhooks/event-types
const resendMap: Record<string, WebhookEvent["type"]> = {
  "email.sent": "delivered",
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
};
export const parseResend: Parser = (body) => {
  if (!body?.type) return [];
  const t = resendMap[body.type];
  if (!t) return [];
  return [{
    provider: "RESEND",
    type: t,
    providerMessageId: body.data?.email_id,
    recipient: body.data?.to?.[0],
    receivedAt: new Date(body.created_at ?? Date.now()),
    raw: body,
  }];
};

// ----- Brevo -----
// https://developers.brevo.com/docs/transactional-webhooks
const brevoMap: Record<string, WebhookEvent["type"]> = {
  delivered: "delivered",
  hard_bounce: "bounced",
  soft_bounce: "bounced",
  spam: "complained",
  invalid_email: "rejected",
  deferred: "deferred",
  blocked: "rejected",
  unsubscribed: "unsubscribed",
  opened: "opened",
  click: "clicked",
};
export const parseBrevo: Parser = (body) => {
  const arr = Array.isArray(body) ? body : [body];
  const out: WebhookEvent[] = [];
  for (const e of arr) {
    const t = brevoMap[e.event];
    if (!t) continue;
    out.push({
      provider: "BREVO",
      type: t,
      providerMessageId: e["message-id"] ?? e.message_id,
      recipient: e.email,
      reason: e.reason,
      receivedAt: new Date(e.ts ? e.ts * 1000 : Date.now()),
      raw: e,
    });
  }
  return out;
};

// ----- SendGrid -----
// https://docs.sendgrid.com/for-developers/tracking-events/event
const sgMap: Record<string, WebhookEvent["type"]> = {
  delivered: "delivered",
  bounce: "bounced",
  dropped: "rejected",
  spamreport: "complained",
  unsubscribe: "unsubscribed",
  open: "opened",
  click: "clicked",
  deferred: "deferred",
};
export const parseSendGrid: Parser = (body) => {
  const arr = Array.isArray(body) ? body : [body];
  const out: WebhookEvent[] = [];
  for (const e of arr) {
    const t = sgMap[e.event];
    if (!t) continue;
    out.push({
      provider: "SENDGRID",
      type: t,
      providerMessageId: e.sg_message_id?.split(".")[0],
      recipient: e.email,
      reason: e.reason,
      receivedAt: new Date(e.timestamp ? e.timestamp * 1000 : Date.now()),
      raw: e,
    });
  }
  return out;
};

// ----- MailerSend -----
// https://developers.mailersend.com/general.html#webhooks
const msMap: Record<string, WebhookEvent["type"]> = {
  "activity.delivered": "delivered",
  "activity.hard_bounced": "bounced",
  "activity.soft_bounced": "bounced",
  "activity.spam_complaint": "complained",
  "activity.unsubscribed": "unsubscribed",
  "activity.opened": "opened",
  "activity.clicked": "clicked",
};
export const parseMailerSend: Parser = (body) => {
  const t = msMap[body?.type];
  if (!t) return [];
  return [{
    provider: "MAILERSEND",
    type: t,
    providerMessageId: body.data?.email?.message?.id,
    recipient: body.data?.email?.recipient?.email,
    receivedAt: new Date(body.created_at ?? Date.now()),
    raw: body,
  }];
};

// ----- Mailjet -----
// https://dev.mailjet.com/email/guides/webhooks/
const mjMap: Record<string, WebhookEvent["type"]> = {
  sent: "delivered",
  bounce: "bounced",
  blocked: "rejected",
  spam: "complained",
  unsub: "unsubscribed",
  open: "opened",
  click: "clicked",
};
export const parseMailjet: Parser = (body) => {
  const arr = Array.isArray(body) ? body : [body];
  const out: WebhookEvent[] = [];
  for (const e of arr) {
    const t = mjMap[e.event];
    if (!t) continue;
    out.push({
      provider: "MAILJET",
      type: t,
      providerMessageId: String(e.MessageID ?? ""),
      recipient: e.email,
      reason: e.error_related_to ?? e.error,
      receivedAt: new Date(e.time ? e.time * 1000 : Date.now()),
      raw: e,
    });
  }
  return out;
};

export const PARSERS: Record<string, Parser> = {
  resend: parseResend,
  brevo: parseBrevo,
  sendgrid: parseSendGrid,
  mailersend: parseMailerSend,
  mailjet: parseMailjet,
};
