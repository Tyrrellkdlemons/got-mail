import type { ProviderKind, ProviderModule } from "./types";
import { brevo } from "./brevo";
import { mailjet } from "./mailjet";
import { resend } from "./resend";
import { postmark } from "./postmark";
import { sendgrid } from "./sendgrid";
import { smtp } from "./smtp";
import { postal } from "./postal";
import { listmonk } from "./listmonk";
import { mautic } from "./mautic";

// smtp handles gmail, google-workspace, zoho, outlook and generic SMTP.
// ses is a TODO (AWS SDK).
export const providers: Record<string, ProviderModule> = {
  brevo,
  mailjet,
  resend,
  postmark,
  sendgrid,
  smtp,
  gmail: smtp,
  "google-workspace": smtp,
  postal,
  listmonk,
  mautic,
};

export function getProvider(kind: string): ProviderModule {
  const p = providers[kind];
  if (!p) throw new Error(`Unknown provider kind: ${kind}`);
  return p;
}

export type { ProviderModule, ProviderKind };
