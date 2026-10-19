export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_api_key;
  if (!apiKey) return res.status(503).json({ error: 'AI үйлчилгээ тохируулаагүй байна.' });

  const message = String(req.body?.message || '').slice(0, 2000);
  if (!message) return res.status(400).json({ error: 'Асуултаа оруулна уу.' });

  const prompt = `You are ZAM AI, a careful Mongolian travel-planning concierge. Reply in Mongolian.
User request: ${message}

Give a useful concise travel-planning answer. State that prices, visa rules and availability must be verified on official booking/embassy sources. Do not invent exact live prices, flight schedules, visa requirements, or reservations. Ask at most one helpful follow-up question if essential. Include practical advice about transport, documents, safety, and timing where relevant.`;
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 700, temperature: 0.5 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'AI хүсэлт амжилтгүй боллоо.');
    const answer = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
    if (!answer) throw new Error('Хариулт үүссэнгүй.');
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Gemini chat request failed:', error.message || error);
    return res.status(502).json({ error: error.message || 'AI үйлчилгээ түр ажиллахгүй байна.' });
  }
}

