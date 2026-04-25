// Suppression list: never email anyone here. Populated by bounces, complaints, and unsubscribes.

export type SuppressionReason =
  | "BOUNCE_HARD"
  | "BOUNCE_SOFT_THRESHOLD"
  | "COMPLAINT"
  | "UNSUBSCRIBE"
  | "MANUAL";

const norm = (e: string) => e.trim().toLowerCase();

export async function isSuppressed(db: any, userId: string, email: string): Promise<boolean> {
  const hit = await db.suppression.findFirst({
    where: { userId, email: norm(email) },
    select: { id: true },
  });
  return !!hit;
}

export async function addSuppression(
  db: any,
  args: {
    userId: string;
    email: string;
    reason: SuppressionReason;
    note?: string;
    providerMessageId?: string;
  },
) {
  return db.suppression.upsert({
    where: { userId_email: { userId: args.userId, email: norm(args.email) } },
    create: {
      userId: args.userId,
      email: norm(args.email),
      reason: args.reason,
      note: args.note,
      providerMessageId: args.providerMessageId,
    },
    update: {
      reason: args.reason,
      note: args.note,
      providerMessageId: args.providerMessageId,
    },
  });
}

export async function filterSuppressed<T extends { email: string }>(
  db: any,
  userId: string,
  recipients: T[],
): Promise<{ kept: T[]; dropped: T[] }> {
  if (recipients.length === 0) return { kept: [], dropped: [] };
  const emails = recipients.map(r => norm(r.email));
  const hits = await db.suppression.findMany({
    where: { userId, email: { in: emails } },
    select: { email: true },
  });
  const blocked = new Set(hits.map((h: any) => h.email));
  const kept: T[] = [], dropped: T[] = [];
  for (const r of recipients) (blocked.has(norm(r.email)) ? dropped : kept).push(r);
  return { kept, dropped };
}
