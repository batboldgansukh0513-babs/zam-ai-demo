export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_api_key;
  if (!apiKey) return res.status(503).json({ error: 'AI үйлчилгээ тохируулаагүй байна.' });

  const message = String(req.body?.message || '').slice(0, 2000).trim();
  if (!message) return res.status(400).json({ error: 'Асуултаа оруулна уу.' });

  const prompt = `You are ZAM AI, a careful Mongolian travel-planning concierge. Reply in Mongolian.
User request: ${message}

For facts that can change—visa rules, entry requirements, flight/transport schedules, price ranges, weather, closures, safety notices, and availability—use Google Search. Prefer official embassies, immigration authorities, airlines, airports, rail or bus operators, and tourism boards. Give a concise, practical answer with a clear next action. Never present a live price, schedule, visa rule, or reservation as guaranteed: label estimates and tell the traveler to verify official sources before booking.`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        input: prompt,
        tools: [{ type: 'google_search' }]
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'AI хүсэлт амжилтгүй боллоо.');

    const blocks = (data.steps || [])
      .filter(step => step.type === 'model_output')
      .flatMap(step => step.content || [])
      .filter(block => block.type === 'text');
    const answer = data.output_text || data.outputText || blocks.map(block => block.text || '').join('\n').trim();
    const seen = new Set();
    const sources = blocks.flatMap(block => block.annotations || [])
      .filter(note => note.type === 'url_citation' && (note.url || note.uri))
      .map(note => ({ title: note.title || 'Эх сурвалж', url: note.url || note.uri }))
      .filter(item => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      })
      .slice(0, 4);

    if (!answer) throw new Error('Хариулт үүссэнгүй.');
    return res.status(200).json({ answer, sources, grounded: sources.length > 0 });
  } catch (error) {
    console.error('Gemini live search failed:', error.message || error);
    return res.status(502).json({ error: error.message || 'AI үйлчилгээ түр ажиллахгүй байна.' });
  }
}
