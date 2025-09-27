import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

// Create new candidate
router.post("/", async (req, res) => {
  try {
    const candidate = await prisma.candidate.create({
      data: {
        name: req.body.name || "Unnamed",
        email: req.body.email || null,
      },
    });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List candidates
router.get("/", async (req, res) => {
  const candidates = await prisma.candidate.findMany();
  res.json(candidates);
});

export default router;
