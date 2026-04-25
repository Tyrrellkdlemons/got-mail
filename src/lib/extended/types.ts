// Shared types for the extended provider system.

export type Address = { email: string; name?: string };

export type SendArgs = {
  from: Address;
  to: Address[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: Address;
  cc?: Address[];
  bcc?: Address[];
  headers?: Record<string, string>;
  /** Stable per-message id you generate so webhooks can correlate. */
  messageId?: string;
};

export type SendResult = {
  /** Provider-side message id. */
  id: string;
  provider: ProviderName;
};

export type ValidateResult = { ok: true; account?: unknown };

export interface ProviderAdapter {
  name: ProviderName;
  validate(apiKey: string): Promise<ValidateResult>;
  send(apiKey: string, args: SendArgs): Promise<SendResult>;
  /** Returns true if the error means "we are over quota / rate limited / disabled". */
  isQuotaError?(err: unknown): boolean;
  /** Optional helpers for webhooks. */
  parseWebhook?(body: unknown, headers: Headers): WebhookEvent[] | null;
}

export type ProviderName =
  | "RESEND"
  | "BREVO"
  | "SENDGRID"
  | "MAILERSEND"
  | "MAILJET"
  | "SMTP2GO"
  | "ELASTICEMAIL"
  | "POSTMARK"
  | "MAILTRAP"
  | "ZEPTOMAIL"
  | "AMAZONSES"
  | "MAILCHANNELS"
  | "POSTAL"
  | "GENERIC_SMTP";

export type WebhookEventType =
  | "delivered"
  | "bounced"
  | "complained"
  | "opened"
  | "clicked"
  | "unsubscribed"
  | "rejected"
  | "deferred";

export type WebhookEvent = {
  provider: ProviderName;
  type: WebhookEventType;
  providerMessageId?: string;
  recipient?: string;
  reason?: string;
  receivedAt: Date;
  raw: unknown;
};
