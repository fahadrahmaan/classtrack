import { GoogleGenAI } from "@google/genai";
const MODEL = "gemini-flash-lite-latest";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { windowLog, trainerName, topic, sessionFormat, trade, learnerCount, } = req.body;

  if (!windowLog || windowLog.length === 0) {
    return res.status(400).json({
      error: "No session data provided",
    });
  }

  // Build a compact summary of the observation
  const summary = windowLog
    .map(
      (w) =>
        `${w.type} window: ${w.chipsSelected.join(", ") || "no activity"
        }`
    )
    .join("\n");

  const prompt = `
You are an experienced instructional coach providing supportive feedback after a classroom observation.

Trainer:
${trainerName}

Topic:
${topic}

Trade:
${trade}

Learners:
${learnerCount}

Session Format:
${sessionFormat}

Observation Timeline:
${summary}

Write feedback using exactly these three sections.

Overall Observation

Write 1–2 concise sentences summarizing the overall teaching and learner engagement.

Positive Highlight

Write one sentence describing a specific positive teaching moment.

Suggestion for Next Session

Write one practical coaching suggestion that the trainer can realistically apply during the next lesson.

Requirements:

- Friendly and supportive.
- Specific to the observation.
- Do not invent events.
- Do not mention ICAP terminology.
- Do not use markdown.
- Keep the entire response under 140 words.
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const insight = result.text;

    console.log("Gemini Response:", insight);

    if (!insight || !insight.trim()) {
      return res.status(502).json({
        error: "No insight generated",
      });
    }

    return res.status(200).json({
      insight: insight.trim(),
    });
  } catch (err) {
    console.error("AI insight generation failed:", err);

    return res.status(500).json({
      error: "Generation failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}