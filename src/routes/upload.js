import express from "express";
import multer from "multer";
import prisma from "../db/prisma.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload CV
router.post("/cv", upload.single("file"), async (req, res) => {
  try {
    const candidateId = req.body.candidateId; // ambil dari form-data
    const file = await prisma.file.create({
      data: {
        candidateId,
        type: "cv",
        filename: req.file.originalname,
        path: req.file.path,
      },
    });
    res.json({ success: true, file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Project
router.post("/project", upload.single("file"), async (req, res) => {
  try {
    const candidateId = req.body.candidateId; // ambil dari form-data
    const file = await prisma.file.create({
      data: {
        candidateId,
        type: "project",
        filename: req.file.originalname,
        path: req.file.path,
      },
    });
    res.json({ success: true, file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
