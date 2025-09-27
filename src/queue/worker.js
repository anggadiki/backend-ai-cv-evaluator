import { Worker } from "bullmq";
import Redis from "ioredis";
import prisma from "../db/prisma.js";
import { evaluateCandidate } from "../services/projectEvaluator.js";
import { initRag } from "../services/ragService.js";

// tambahkan maxRetriesPerRequest: null
const connection = new Redis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

// Init RAG
(async () => {
  console.log("🔄 Initializing RAG store...");
  await initRag();
  console.log("✅ RAG ready.");
})();

const worker = new Worker(
  "evaluation",
  async (job) => {
    const { jobId, candidateId } = job.data;

    console.log(`🚀 Processing evaluation job: ${jobId}`);

    await prisma.evaluation.update({
      where: { id: jobId },
      data: { status: "processing" },
    });

    try {
      const result = await evaluateCandidate(job.data);

      await prisma.evaluation.update({
        where: { id: jobId },
        data: {
          status: "completed",
          result: result.result,
        },
      });

      console.log(`✅ Job ${jobId} completed.`);
      return result;
    } catch (err) {
      console.error(`❌ Job ${jobId} failed:`, err.message);

      await prisma.evaluation.update({
        where: { id: jobId },
        data: {
          status: "failed",
          result: { error: err.message },
        },
      });

      throw err;
    }
  },
  { connection, concurrency: 2 }
);

worker.on("completed", (job) => {
  console.log(`🎉 Worker: job ${job.id} finished successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Worker: job ${job.id} failed with error: ${err.message}`);
});
