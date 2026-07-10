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

Return ONLY valid JSON. Return exactly this structure:
{
  "overallObservation": "...",
  "positiveHighlight": "...",
  "nextSessionSuggestion": "..."
}

Requirements:

- overallObservation: maximum 2 concise sentences.
- positiveHighlight: exactly 1 sentence.
- nextSessionSuggestion: exactly 1 actionable sentence.
- Friendly and supportive.
- Specific to the observation.
- Do not invent events.
- Do not mention ICAP terminology.
- No markdown.
- No bullet points.
- No additional keys.
- No explanations outside the JSON.
- Never wrap the JSON inside code blocks.
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
        responseMimeType: "application/json",
      },
    });

    const insight = result.text;

    console.log("Gemini Response:", insight);

    if (!insight || !insight.trim()) {
      return res.status(502).json({
        error: "No insight generated",
      });
    }

    let parsedInsight;
    try {
      parsedInsight = JSON.parse(insight);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", insight);
      return res.status(502).json({
        error: "Invalid response format from AI",
      });
    }

    if (!parsedInsight.overallObservation || !parsedInsight.positiveHighlight || !parsedInsight.nextSessionSuggestion) {
      return res.status(502).json({
        error: "Missing required fields in AI response",
      });
    }

    return res.status(200).json({
      insight: parsedInsight,
    });
  } catch (err) {
    console.error("AI insight generation failed:", err);

    return res.status(500).json({
      error: "Generation failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}