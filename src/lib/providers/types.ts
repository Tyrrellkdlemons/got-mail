/**
 * Got Mail — Provider abstraction layer
 * Every provider module implements this interface.
 */

export type EmailMessage = {
  to: string;
  toName?: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>; // must include List-Unsubscribe
  tags?: string[];
  campaignId?: string;
  messageId?: string;
};

export type SendResult = {
  ok: boolean;
  providerMessageId?: string;
  status: "SENT" | "DEFERRED" | "FAILED";
  errorCode?: string;
  errorMessage?: string;
};

export type Quota = {
  perSecond?: number | null;
  perMinute?: number | null;
  perHour?: number | null;
  perDay?: number | null;
  perMonth?: number | null;
  burstCapacity?: number | null;
  sentToday?: number;
  sentThisMonth?: number;
  resetsAt?: Date;
};

export type WebhookPayload = {
  raw: unknown;
  events: {
    type: "delivered" | "bounce" | "complaint" | "open" | "click" | "unsubscribe" | "deferred";
    email?: string;
    messageId?: string;
    reason?: string;
    occurredAt?: Date;
  }[];
};

export interface ProviderModule {
  readonly kind: string;
  readonly displayName: string;

  validateConnection(config: ProviderConfig): Promise<{ ok: boolean; error?: string }>;
  getQuota(config: ProviderConfig): Promise<Quota>;

  sendEmail(config: ProviderConfig, msg: EmailMessage): Promise<SendResult>;
  /** Optional batch API. Default falls back to sequential sendEmail. */
  sendBatch?(config: ProviderConfig, msgs: EmailMessage[]): Promise<SendResult[]>;

  handleWebhook(config: ProviderConfig, body: unknown, signature?: string): Promise<WebhookPayload>;

  pauseSending?(config: ProviderConfig): Promise<void>;

  supportsMarketing(): boolean;
  supportsTransactional(): boolean;
  supportsBulk(): boolean;
  requiresVerifiedDomain(): boolean;
}

export type ProviderConfig = {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  webhookSecret?: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    useTls: boolean;
  };
};

export const PROVIDER_KINDS = [
  "brevo",
  "mailjet",
  "resend",
  "postmark",
  "sendgrid",
  "ses",
  "smtp",
  "gmail",
  "google-workspace",
  "postal",
  "listmonk",
  "mautic",
  // added 2026-04-24: extended free-tier providers
  "mailersend",
  "smtp2go",
  "elasticemail",
  "mailtrap",
  "zeptomail",
] as const;

export type ProviderKind = (typeof PROVIDER_KINDS)[number];
