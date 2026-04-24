/**
 * Got Mail — Queue worker.
 * Runs as an always-on process (Railway, Fly, Render) OR as a scheduled Netlify Function.
 * Polls SendJobs and processes ready batches.
 */

import { prisma } from "@/lib/db";
import { processNextBatch } from "@/lib/sending/engine";

const POLL_INTERVAL_MS = 5_000;

export async function tick() {
  const jobs = await prisma.sendJob.findMany({
    where: { status: { in: ["PENDING", "RUNNING"] } },
    take: 10,
  });
  for (const job of jobs) {
    // In a real run this would pull provider config from ProviderAccount + decrypt secrets.
    // Scaffold version calls the provider module with an empty config, which will short-circuit with FAILED in production.
    await processNextBatch(job.id, "brevo", {}).catch((e) => {
      console.error("[worker] job", job.id, "error:", e?.message);
    });
  }
}

async function main() {
  console.log("Got Mail worker started. Polling every", POLL_INTERVAL_MS, "ms.");
  while (true) {
    try {
      await tick();
    } catch (e: any) {
      console.error("[worker] tick error:", e?.message);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

if (require.main === module) {
  main();
}
