export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { windowLog, trainerName, topic } = req.body

  if (!windowLog || windowLog.length === 0) {
    return res.status(400).json({ error: 'No session data provided' })
  }

  // Build a compact summary of the session for the prompt
  const summary = windowLog.map(w =>
    `${w.type} window: ${w.chipsSelected.join(', ') || 'no activity'}`
  ).join('\n')

  const prompt = `You are a supportive teaching coach. Below is a log of classroom observation windows for a trainer named ${trainerName}, topic: ${topic}. Each window shows what was observed either from the trainer or the learners.

${summary}

Write a short, encouraging coaching insight in 2-3 sentences. Structure:
1. One sentence naming the dominant pattern you notice.
2. One sentence naming a specific strong moment, with when it happened (early, middle, or late in session).
3. One sentence suggesting a specific, concrete action to try next session.

Keep it warm, plain-language, no jargon like "ICAP" or "Interactive/Passive" labels. Talk like a supportive peer, not an evaluator. Return only the 2-3 sentences, no preamble.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      }
    )

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text };
    }

    console.log("Google Status:", response.status);
    console.log("Google Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || null

    if (!insight) {
      return res.status(502).json({ error: 'No insight generated', details: data });
    }

    return res.status(200).json({ insight: insight.trim() })
  } catch (err) {
    console.error('AI insight generation failed:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
