import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const LANG_INSTRUCTIONS = {
  English: "Respond in clear, simple English.",
  Malayalam: "മലയാളത്തിൽ ലളിതമായി മറുപടി നൽകുക.",
  Hindi: "सरल हिंदी में उत्तर दें।",
  Tamil: "எளிய தமிழில் பதிலளிக்கவும்.",
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const question = (body.question || '').toString().slice(0, 2000);
    const language = body.language || 'English';
    const farmerContext = body.farmerContext || {};
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!question.trim()) {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    const ctxParts = [];
    if (farmerContext.crop) ctxParts.push(`Primary crop: ${farmerContext.crop}`);
    if (farmerContext.location) ctxParts.push(`Location: ${farmerContext.location}`);
    if (farmerContext.farmSize) ctxParts.push(`Farm size: ${farmerContext.farmSize} ${farmerContext.farmSizeUnit || 'Acres'}`);
    const contextStr = ctxParts.length ? `Farmer context: ${ctxParts.join(', ')}.` : '';

    const langInstr = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.English;

    const systemPrompt = `You are Kisan Mitra, a friendly, knowledgeable AI farming assistant for Indian farmers. Give practical, actionable advice on crops, diseases, pests, harvest timing, market prices, and farming practices. Keep answers concise (3-6 sentences) unless the farmer asks for detail. ${langInstr} ${contextStr}`;

    const messages = [{ role: 'system', content: systemPrompt }];
    for (const m of history) {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    }
    messages.push({ role: 'user', content: question });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
      model: 'automatic',
    });

    const answer = typeof result === 'string' ? result : (result?.response || JSON.stringify(result));
    return Response.json({ answer });
  } catch (error) {
    return Response.json({ error: error.message || 'AI service unavailable' }, { status: 500 });
  }
}