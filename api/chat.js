export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_api_key;
  if (!apiKey) return res.status(503).json({ error: 'AI үйлчилгээ тохируулаагүй байна.' });

  const message = String(req.body?.message || '').slice(0, 2000).trim();
  if (!message) return res.status(400).json({ error: 'Асуултаа оруулна уу.' });

  const prompt = `You are ZAM AI, a careful Mongolian travel-planning concierge. Reply in Mongolian.
User request: ${message}

If the request starts with GUIDE_MODE, create a detailed Mongolian travel guide using Google Search. Use Markdown. Include these exact sections:
## Яаж очих вэ? — compare at least 3 viable route styles across air, land, sea, or combinations where applicable; state which are realistically feasible.
## Замын дагуух онцлох зүйлс — at least 10 numbered stops, sights, foods or experiences tied to the selected route.
## Замд анхаарах зүйлс — border/visa/transit/safety/weather/booking cautions, distinguishing official facts from advice.
## Очоод хийх 10+ сонголт — at least 10 numbered attractions, neighbourhoods, shops, local foods, day trips or activities.
## Байрлах, хооллох, дотоод тээвэр — practical categories and areas, without inventing live availability or prices.
## Захиалга, мэдээллийн албан ёсны холбоосууд — 5–10 current official websites or apps, in Markdown links, for transport, accommodation, attractions, maps and local transit.
Cite or link current official sources whenever possible. Do not claim a live price, an exact schedule or availability. Never invent a booking link.

For facts that can change—visa rules, entry requirements, transport schedules, weather, closures, safety notices, and availability—use Google Search. Prefer official embassies, immigration authorities, airlines, airports, rail or bus operators, tourism boards and city transit operators.`;

  try {
    const liveResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ model: 'gemini-3.8-flash', input: prompt, tools: [{ type: 'google_search' }] })
    });
    const liveData = await liveResponse.json();

    if (liveResponse.ok) {
      const blocks = (liveData.steps || [])
        .filter(step => step.type === 'model_output')
        .flatMap(step => step.content || [])
        .filter(block => block.type === 'text');
      const answer = liveData.output_text || liveData.outputText || blocks.map(block => block.text || '').join('\n').trim();
      const seen = new Set();
      const sources = blocks.flatMap(block => block.annotations || [])
        .filter(note => note.type === 'url_citation' && (note.url || note.uri))
        .map(note => ({ title: note.title || 'Эх сурвалж', url: note.url || note.uri }))
        .filter(item => !seen.has(item.url) && seen.add(item.url))
        .slice(0, 4);
      if (!answer) throw new Error('Хариулт үүссэнгүй.');
      return res.status(200).json({ answer, sources, grounded: sources.length > 0 });
    }

    const liveError = liveData?.error?.message || 'Бодит хайлт түр ажиллахгүй байна.';
    console.warn('Gemini live search unavailable:', liveError);
    const fallbackResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + '\nGoogle Search is temporarily unavailable. Still return a complete, well-structured Mongolian Markdown guide using every required GUIDE_MODE heading and at least 10 numbered arrival ideas. Do not begin mid-sentence, do not use partial fragments, and do not claim any live schedule, availability, price, visa rule, opening hour, or current closure. Clearly label it as general planning guidance.' }] }],
        generationConfig: { maxOutputTokens: 1800, temperature: 0.35 }
      })
    });
    const fallbackData = await fallbackResponse.json();
    if (!fallbackResponse.ok) throw new Error(fallbackData?.error?.message || liveError);
    const answer = fallbackData?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    if (!answer) throw new Error('Хариулт үүссэнгүй.');
    return res.status(200).json({
      answer,
      sources: [],
      grounded: false,
      notice: 'Бодит web хайлтын quota түр дууссан тул энэ хариулт нь ерөнхий зөвлөмж. Виз, үнэ, хуваарийг албан ёсны сайтаас заавал баталгаажуулаарай.'
    });
  } catch (error) {
    console.error('Gemini request failed:', error.message || error);
    return res.status(502).json({ error: error.message || 'AI үйлчилгээ түр ажиллахгүй байна.' });
  }
}
