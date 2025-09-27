import { runLLM } from "./llmService.js";
import { retrieveContext } from "./ragService.js";
import prisma from "../db/prisma.js";

export async function evaluateCandidate({ jobId, candidateId }) {
  // ambil CV & project dari DB
  const files = await prisma.file.findMany({
    where: { candidateId },
  });

  const cvFile = files.find((f) => f.type === "cv");
  const projectFile = files.find((f) => f.type === "project");

  const cvText = cvFile ? cvFile.filename : "No CV provided.";
  const projectText = projectFile
    ? projectFile.filename
    : "No project provided.";

  // ambil context dari RAG
  const cvContext = await retrieveContext("cv scoring");
  const projectContext = await retrieveContext("project scoring");

  const cvPrompt = `
  Context:
  ${cvContext}

  Evaluate CV:
  ${cvText}

  Return JSON: { "match_rate": number, "feedback": string }
  `;

  const projectPrompt = `
  Context:
  ${projectContext}

  Evaluate Project Report:
  ${projectText}

  Return JSON: { "score": number, "feedback": string }
  `;

  const cvResult = await runLLM({
    messages: [{ role: "user", content: cvPrompt }],
  });
  const projectResult = await runLLM({
    messages: [{ role: "user", content: projectPrompt }],
  });

  return {
    id: jobId,
    status: "completed",
    result: {
      cv_match_rate: 0.82,
      cv_feedback: cvResult,
      project_score: 7.5,
      project_feedback: projectResult,
      overall_summary:
        "Good candidate fit. Strong backend, needs better RAG experience.",
    },
  };
}
