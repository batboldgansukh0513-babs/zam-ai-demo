import OpenAI from 'openai';

const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};
const withHeaders = response => {
  Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value));
  return response;
};

const conciergeInstructions = `You are ZAM, a thoughtful private travel concierge for Mongolian travelers.
Reply in clear, warm Mongolian. Ask one focused follow-up question at a time when key trip details are missing.
For a defined trip, give practical, concise planning advice: route style, pacing, rough budget categories, and next steps.
Do not claim that prices, visa rules, availability, reservations, or live schedules are confirmed. Label estimates clearly and advise checking official sources for visa, border, and booking details.
Avoid markdown tables. Keep answers under 170 Mongolian words.`;

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return withHeaders(response).status(204).end();
  if (request.method !== 'POST') return withHeaders(response).status(405).json({ error: 'POST хүсэлт ашиглана уу.' });
  if (!process.env.OPENAI_API_KEY) return withHeaders(response).status(503).json({ error: 'ZAM AI key тохируулаагүй байна.' });

  const message = String(request.body?.message || '').trim();
  const history = Array.isArray(request.body?.history) ? request.body.history.slice(-8) : [];
  if (!message || message.length > 1200) return withHeaders(response).status(400).json({ error: '1200 тэмдэгтээс богино асуулт бичээрэй.' });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const input = history
      .filter(item => ['user', 'assistant'].includes(item?.role) && typeof item.content === 'string')
      .map(item => ({ role: item.role, content: item.content }))
      .concat({ role: 'user', content: message });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: conciergeInstructions,
      input,
      max_output_tokens: 300,
    });
    return withHeaders(response).status(200).json({ reply: result.output_text || 'Уучлаарай, дахин асуугаарай.' });
  } catch (error) {
    console.error('ZAM chat error', error?.message);
    return withHeaders(response).status(502).json({ error: 'ZAM AI түр хариу өгч чадсангүй. Дахин оролдоорой.' });
  }
}

