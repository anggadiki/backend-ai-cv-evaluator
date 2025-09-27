import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runLLM({
  messages,
  model = "gpt-4o-mini",
  temperature = 0.2,
}) {
  // 👉 MOCK MODE
  if (process.env.LLM_MOCK === "true") {
    return JSON.stringify({
      match_rate: 0.9,
      feedback:
        "Mocked evaluation response. Candidate shows good backend skills.",
    });
  }

  try {
    const res = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });
    return res.choices[0].message.content;
  } catch (err) {
    console.error("LLM Error:", err);
    return JSON.stringify({ error: "Error generating response" });
  }
}
