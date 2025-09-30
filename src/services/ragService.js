// src/services/ragService.js
import prisma from "../db/prisma.js";

let store = []; // {id, type, text}

export async function initRag() {
  // MOCK MODE
  if (process.env.LLM_MOCK === "true") {
    store = [
      { id: "job", type: "job", text: "Mock Job Description" },
      { id: "rubric", type: "rubric", text: "Mock Rubric" },
    ];
    console.log("⚡ RAG running in MOCK mode");
    return;
  }

  // REAL MODE tanpa embeddings (OpenRouter gak support embeddings)
  const jobData = await prisma.jobData.findMany();
  store = jobData.map((item) => ({
    id: item.id,
    type: item.type,
    text: item.content,
  }));

  console.log(`⚡ RAG loaded ${store.length} items (plain text mode).`);
}

export async function retrieveContext(query, topK = 2) {
  if (process.env.LLM_MOCK === "true") {
    return `Mock context for: ${query}`;
  }

  // SIMPLE retrieval: untuk sekarang, cuma ambil N teks pertama
  // Bisa diupgrade ke fuzzy match (contoh pakai string-similarity atau fuse.js)
  return store
    .slice(0, topK)
    .map((s) => s.text)
    .join("\n---\n");
}
