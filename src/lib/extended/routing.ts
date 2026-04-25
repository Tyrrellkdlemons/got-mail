// Smart provider routing: pick the cheapest provider with budget left.
// Use db = your existing Prisma client (e.g. import { db } from "@/lib/db").
import type { ProviderName } from "./types";

export const DAILY_CAP: Record<ProviderName, number> = {
  RESEND: 100,
  BREVO: 300,
  SENDGRID: 100,
  MAILERSEND: 100,
  MAILJET: 200,
  SMTP2GO: 35,
  ELASTICEMAIL: 100,
  POSTMARK: 100,
  MAILTRAP: 35,
  ZEPTOMAIL: 1000,
  AMAZONSES: 200,
  MAILCHANNELS: 1000,
  POSTAL: 999_999,
  GENERIC_SMTP: 999_999,
};

export const MONTHLY_CAP: Record<ProviderName, number> = {
  RESEND: 3000,
  BREVO: 9000,
  SENDGRID: 3000,
  MAILERSEND: 3000,
  MAILJET: 6000,
  SMTP2GO: 1000,
  ELASTICEMAIL: 3000,
  MAILTRAP: 1000,
  POSTMARK: 999_999,
  ZEPTOMAIL: 999_999,
  AMAZONSES: 999_999,
  MAILCHANNELS: 999_999,
  POSTAL: 999_999,
  GENERIC_SMTP: 999_999,
};

const SAFETY = 0.85; // never exceed 85% of any free tier

const dayKey = () => new Date().toISOString().slice(0, 10);
const monthKey = () => new Date().toISOString().slice(0, 7);

export type PickResult = {
  account: any;
  reason: string;
};

/**
 * Pick the next provider account for this user with budget remaining today + this month.
 * Skips accounts that are cooled (after a recent quota error) or disabled.
 */
export async function pickProvider(
  db: any,
  userId: string,
  count = 1,
): Promise<PickResult | null> {
  const accounts = await db.providerAccount.findMany({
    where: { userId, verified: true, disabled: false },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  for (const a of accounts) {
    if (a.cooledUntil && new Date(a.cooledUntil) > new Date()) continue;

    const today = await db.usageDaily.findUnique({
      where: { providerAccountId_date: { providerAccountId: a.id, date: dayKey() } },
    });
    const month = await db.usageMonth.findUnique({
      where: { providerAccountId_yearMonth: { providerAccountId: a.id, yearMonth: monthKey() } },
    });

    const dCap = DAILY_CAP[a.provider as ProviderName] ?? 100;
    const mCap = MONTHLY_CAP[a.provider as ProviderName] ?? 99999;
    const dUsed = today?.sent ?? 0;
    const mUsed = month?.sent ?? 0;
    if (dUsed + count > dCap * SAFETY) continue;
    if (mUsed + count > mCap * SAFETY) continue;

    return {
      account: a,
      reason: `picked ${a.provider} (today ${dUsed}/${dCap}, month ${mUsed}/${mCap})`,
    };
  }
  return null;
}

export async function recordSend(db: any, providerAccountId: string, count = 1) {
  await db.$transaction([
    db.usageDaily.upsert({
      where: { providerAccountId_date: { providerAccountId, date: dayKey() } },
      create: { providerAccountId, date: dayKey(), sent: count },
      update: { sent: { increment: count } },
    }),
    db.usageMonth.upsert({
      where: { providerAccountId_yearMonth: { providerAccountId, yearMonth: monthKey() } },
      create: { providerAccountId, yearMonth: monthKey(), sent: count },
      update: { sent: { increment: count } },
    }),
  ]);
}

export async function recordBounce(db: any, providerAccountId: string, count = 1) {
  await db.usageDaily.upsert({
    where: { providerAccountId_date: { providerAccountId, date: dayKey() } },
    create: { providerAccountId, date: dayKey(), bounced: count, sent: 0 },
    update: { bounced: { increment: count } },
  });
}

export async function coolProvider(db: any, providerAccountId: string, hours = 24) {
  await db.providerAccount.update({
    where: { id: providerAccountId },
    data: { cooledUntil: new Date(Date.now() + hours * 3_600_000) },
  });
}
