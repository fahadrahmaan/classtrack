import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { windowLog, trainerName, topic } = req.body;

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

  const prompt = `You are a supportive teaching coach.

Below is a classroom observation for trainer "${trainerName}".

Topic:
${topic}

Observation Timeline:
${summary}

Write a coaching insight in exactly 3 sentences.

Sentence 1:
Describe the dominant teaching/learning pattern observed.

Sentence 2:
Mention one positive moment from the observation.

Sentence 3:
Suggest one practical action the trainer can try next session.

Requirements:
- Warm and supportive tone.
- Plain English.
- No educational jargon.
- No markdown.
- No bullet points.
- Return only the three sentences.
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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