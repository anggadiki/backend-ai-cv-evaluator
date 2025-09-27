import express from "express";
import { Queue } from "bullmq";
import Redis from "ioredis";
import prisma from "../db/prisma.js";

const router = express.Router();

const connection = new Redis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

const evalQueue = new Queue("evaluation", { connection });

// enqueue evaluation
router.post("/", async (req, res) => {
  const { candidateId } = req.body;

  // buat row evaluation
  const evaluation = await prisma.evaluation.create({
    data: {
      candidateId,
      status: "queued",
    },
  });

  // enqueue job ke Redis
  await evalQueue.add("evaluation", {
    jobId: evaluation.id,
    candidateId,
  });

  res.json({ id: evaluation.id, status: evaluation.status });
});

export default router;
