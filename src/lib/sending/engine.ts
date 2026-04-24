/**
 * Got Mail — Sending Engine
 * Batches, throttles, enforces quotas, monitors health, pauses on circuit breaker.
 */

import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/providers";
import type { ProviderConfig, EmailMessage } from "@/lib/providers/types";

export const ENGINE_CONFIG = {
  defaultBatchSize: 50,
  bounceRatePauseAt: 2.0, // %
  complaintRatePauseAt: 0.1, // %
  rapidUnsubPauseAt: 5.0, // %
  bounceRateWindow: 500, // sends
  complaintRateWindow: 1000,
  warmupDays: [50, 100, 200, 400, 800, 1500, 3000, 5000, 8000, 15000],
};

/**
 * Build a SendJob: materialize recipients, filter, split into batches.
 * Returns the job id.
 */
export async function createSendJob(params: {
  workspaceId: string;
  campaignId: string;
  sendingIdentityId?: string;
  providerAccountId?: string;
  candidateContactIds: string[];
  batchSize?: number;
}) {
  const batchSize = params.batchSize ?? ENGINE_CONFIG.defaultBatchSize;

  // Filter: drop non-consent, unsub, bounce, complaint, suppression
  const [contacts, suppressed] = await Promise.all([
    prisma.contact.findMany({
      where: {
        id: { in: params.candidateContactIds },
        workspaceId: params.workspaceId,
        consentStatus: { in: ["VERIFIED", "IMPORTED_WITH_PROOF"] },
      },
      select: { id: true, email: true, consentStatus: true },
    }),
    prisma.suppression.findMany({
      where: { workspaceId: params.workspaceId },
      select: { email: true },
    }),
  ]);

  const suppressedSet = new Set(suppressed.map((s) => s.email.toLowerCase()));
  const keep = contacts.filter((c) => !suppressedSet.has(c.email.toLowerCase()));

  const job = await prisma.sendJob.create({
    data: {
      workspaceId: params.workspaceId,
      campaignId: params.campaignId,
      sendingIdentityId: params.sendingIdentityId,
      providerAccountId: params.providerAccountId,
      totalRecipients: keep.length,
      status: "PENDING",
    },
  });

  // Create CampaignRecipient rows
  await prisma.campaignRecipient.createMany({
    data: keep.map((c) => ({
      campaignId: params.campaignId,
      contactId: c.id,
      status: "QUEUED",
    })),
  });

  // Split into batches. Schedule with per-batch sendAfter based on quota.
  const recipientIds = (await prisma.campaignRecipient.findMany({
    where: { campaignId: params.campaignId, status: "QUEUED" },
    select: { id: true },
  })).map((r) => r.id);

  const now = Date.now();
  for (let i = 0; i < recipientIds.length; i += batchSize) {
    const slice = recipientIds.slice(i, i + batchSize);
    // Very simple throttle: one batch per 30s (tunable per provider quota elsewhere)
    const sendAfter = new Date(now + (i / batchSize) * 30_000);
    await prisma.sendingBatch.create({
      data: {
        sendJobId: job.id,
        size: slice.length,
        sendAfter,
        recipientIdsJson: JSON.stringify(slice),
      },
    });
  }

  return job.id;
}

/**
 * Process the next ready batch for a job.
 * Worker calls this on a loop.
 */
export async function processNextBatch(jobId: string, providerKind: string, config: ProviderConfig) {
  const job = await prisma.sendJob.findUnique({
    where: { id: jobId },
    include: {
      campaign: true,
      sendingIdentity: true,
    },
  });
  if (!job) return { done: true };
  if (job.status === "PAUSED_CIRCUIT_BREAKER" || job.status === "PAUSED_MANUAL") {
    return { paused: true, reason: job.pauseReason };
  }

  const batch = await prisma.sendingBatch.findFirst({
    where: { sendJobId: jobId, finishedAt: null, sendAfter: { lte: new Date() } },
    orderBy: { sendAfter: "asc" },
  });
  if (!batch) return { done: true };

  await prisma.sendingBatch.update({
    where: { id: batch.id },
    data: { startedAt: new Date() },
  });

  const recipientIds: string[] = JSON.parse(batch.recipientIdsJson);
  const recipients = await prisma.campaignRecipient.findMany({
    where: { id: { in: recipientIds } },
    include: { contact: true },
  });

  const provider = getProvider(providerKind);
  let sent = 0, failed = 0;

  for (const r of recipients) {
    if (!r.contact) continue;

    // Re-check suppression at send-time
    const suppressed = await prisma.suppression.findFirst({
      where: { workspaceId: job.workspaceId, email: r.contact.email },
    });
    if (suppressed) {
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "SUPPRESSED", reason: `suppressed:${suppressed.reason}` },
      });
      continue;
    }

    const msg: EmailMessage = {
      to: r.contact.email,
      toName: [r.contact.firstName, r.contact.lastName].filter(Boolean).join(" ") || undefined,
      from: job.sendingIdentity?.fromEmail ?? "noreply@example.com",
      fromName: job.sendingIdentity?.fromName ?? undefined,
      replyTo: job.sendingIdentity?.replyTo ?? undefined,
      subject: job.campaign.subject,
      html: personalize(job.campaign.html, r.contact),
      text: personalize(job.campaign.text, r.contact),
      headers: {
        "List-Unsubscribe": `<${process.env.APP_URL}/unsubscribe/${r.id}>, <mailto:unsubscribe@example.com?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      campaignId: job.campaignId,
    };

    const result = await provider.sendEmail(config, msg);
    await prisma.emailSend.create({
      data: {
        workspaceId: job.workspaceId,
        campaignId: job.campaignId,
        contactId: r.contactId,
        messageId: result.providerMessageId,
        subject: msg.subject,
        toEmail: msg.to,
        fromEmail: msg.from,
        status: result.status,
        providerKind,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      },
    });

    if (result.ok) {
      sent++;
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "SENT" },
      });
    } else {
      failed++;
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "FAILED", reason: result.errorMessage },
      });
    }
  }

  await prisma.sendingBatch.update({
    where: { id: batch.id },
    data: { finishedAt: new Date(), sent, failed },
  });
  await prisma.sendJob.update({
    where: { id: jobId },
    data: { sent: { increment: sent }, failed: { increment: failed }, status: "RUNNING" },
  });

  // Circuit breaker
  await checkCircuitBreaker(jobId, job.workspaceId);

  return { sent, failed };
}

async function checkCircuitBreaker(jobId: string, workspaceId: string) {
  const recent = await prisma.emailSend.findMany({
    where: { workspaceId },
    orderBy: { sentAt: "desc" },
    take: ENGINE_CONFIG.bounceRateWindow,
    select: { status: true },
  });
  if (recent.length < 50) return; // not enough signal
  const total = recent.length;
  const bounced = recent.filter((r) => r.status === "BOUNCED" || r.status === "FAILED").length;
  const bouncePct = (bounced / total) * 100;
  if (bouncePct >= ENGINE_CONFIG.bounceRatePauseAt) {
    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "PAUSED_CIRCUIT_BREAKER", pauseReason: `Bounce rate ${bouncePct.toFixed(2)}%` },
    });
  }
}

function personalize(body: string, contact: { firstName?: string | null; lastName?: string | null; email: string }) {
  return body
    .replace(/\{\{\s*first_name\s*\}\}/g, contact.firstName ?? "")
    .replace(/\{\{\s*last_name\s*\}\}/g, contact.lastName ?? "")
    .replace(/\{\{\s*email\s*\}\}/g, contact.email);
}
