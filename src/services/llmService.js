// src/services/llmService.js
import fetch from "node-fetch";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const LLM_MOCK = process.env.LLM_MOCK === "true";

/**
 * Run LLM with prompt string.
 * Returns string (model text) or "LLM Error: ..." on failure.
 */
export async function runLLM(prompt, opts = {}) {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return "LLM Error: Empty prompt passed to model";
  }

  if (LLM_MOCK) {
    // deterministic mock useful for tests
    return JSON.stringify({
      match_rate: 0.9,
      feedback:
        "Mocked evaluation response. Candidate shows good backend skills.",
    });
  }

  try {
    console.log(
      "🔎 LLM prompt preview:",
      prompt.slice(0, 600).replace(/\n/g, " ")
    );

    const body = {
      model: opts.model || "x-ai/grok-4-fast:free",
      messages: [
        {
          role: "system",
          content: opts.system || "You are an expert CV and project evaluator.",
        },
        { role: "user", content: prompt },
      ],
      temperature:
        typeof opts.temperature === "number" ? opts.temperature : 0.3,
      max_tokens: typeof opts.max_tokens === "number" ? opts.max_tokens : 1024,
    };

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.error) {
      console.error("LLM error response:", data);
      return `LLM Error: ${data.error.message || JSON.stringify(data.error)}`;
    }

    // Try common paths:
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.response ??
      null;

    if (!content) {
      console.error(
        "LLM unexpected response:",
        JSON.stringify(data).slice(0, 2000)
      );
      return `LLM Error: Unexpected response format`;
    }

    return content;
  } catch (err) {
    console.error("LLM call failed:", err);
    return `LLM Error: ${err.message}`;
  }
}
