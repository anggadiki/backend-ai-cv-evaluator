import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

/**
 * GET /result/:id
 * Ambil status + hasil evaluasi kandidat
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { candidate: true }, // lihat data kandidat juga
    });

    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    res.json({
      id: evaluation.id,
      candidate: evaluation.candidate
        ? { id: evaluation.candidate.id, name: evaluation.candidate.name }
        : null,
      status: evaluation.status,
      result: evaluation.result,
      createdAt: evaluation.createdAt,
    });
  } catch (err) {
    console.error("Error fetching result:", err);
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

export default router;
