import OpenAI from "openai";
import prisma from "../db/prisma.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let store = []; // {id, type, text, embedding}

export async function initRag() {
  // MOCK MODE: skip panggil OpenAI kalau LLM_MOCK=true
  if (process.env.LLM_MOCK === "true") {
    store = [
      {
        id: "job",
        type: "job",
        text: "Mock Job Description",
        embedding: [0.1, 0.2, 0.3],
      },
      {
        id: "rubric",
        type: "rubric",
        text: "Mock Rubric",
        embedding: [0.2, 0.3, 0.4],
      },
    ];
    console.log("⚡ RAG running in MOCK mode");
    return;
  }

  // REAL MODE: panggil OpenAI embeddings
  const jobData = await prisma.jobData.findMany();
  store = [];
  for (const item of jobData) {
    const emb = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: item.content,
    });
    store.push({
      id: item.id,
      type: item.type,
      text: item.content,
      embedding: emb.data[0].embedding,
    });
  }
}

function cosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export async function retrieveContext(query, topK = 2) {
  // MOCK MODE: langsung return dummy text
  if (process.env.LLM_MOCK === "true") {
    return `Mock context for: ${query}`;
  }

  // REAL MODE: embedding beneran
  const qEmb = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const q = qEmb.data[0].embedding;

  const scored = store.map((s) => ({
    ...s,
    score: cosineSimilarity(s.embedding, q),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, topK)
    .map((s) => s.text)
    .join("\n---\n");
}
