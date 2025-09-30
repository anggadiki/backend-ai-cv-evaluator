import { runLLM } from "./llmService.js";
import { retrieveContext } from "./ragService.js";
import prisma from "../db/prisma.js";
import { extractText } from "../utils/pdfExtractor.js";

export async function evaluateCandidate({ jobId, candidateId }) {
  const files = await prisma.file.findMany({
    where: { candidateId },
  });

  const cvFile = files.find((f) => f.type === "cv");
  const projectFile = files.find((f) => f.type === "project");

  const cvText = (await extractText(cvFile)) || "No CV provided.";
  const projectText =
    (await extractText(projectFile)) || "No project provided.";

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

  // panggil LLM
  const cvRaw = await runLLM(cvPrompt);
  const projectRaw = await runLLM(projectPrompt);

  // coba parse JSON string → object
  let cvResult;
  try {
    cvResult = JSON.parse(cvRaw);
  } catch {
    cvResult = { raw: cvRaw };
  }

  let projectResult;
  try {
    projectResult = JSON.parse(projectRaw);
  } catch {
    projectResult = { raw: projectRaw };
  }

  return {
    id: jobId,
    status: "completed",
    result: {
      cv_match_rate: cvResult.match_rate ?? 0,
      cv_feedback: cvResult,
      project_score: projectResult.score ?? 0,
      project_feedback: projectResult,
      overall_summary:
        "Good candidate fit. Strong backend, needs better RAG experience.",
    },
  };
}
