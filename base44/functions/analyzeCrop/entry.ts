import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const LANG_INSTRUCTIONS = {
  English: "Write all fields in clear English.",
  Malayalam: "എല്ലാ ഫീൽഡുകളും മലയാളത്തിൽ എഴുതുക.",
  Hindi: "सभी फ़ील्ड हिंदी में लिखें।",
  Tamil: "அனைத்து புலங்களையும் தமிழில் எழுதவும்.",
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const imageUrl = (body.image_url || '').toString();
    const crop = (body.crop || 'Tomato').toString();
    const language = body.language || 'English';

    if (!imageUrl) return Response.json({ error: 'Image is required' }, { status: 400 });

    const langInstr = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.English;

    const prompt = `You are Kisan Mitra's Crop Doctor, an expert plant pathologist for Indian farmers. Analyze the uploaded leaf/crop image (crop: ${crop}). Identify the most likely disease or condition, or state if the plant looks healthy. ${langInstr} Be realistic and practical. If the image is unclear or not a plant, say so in the disease field.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [imageUrl],
      model: 'automatic',
      response_json_schema: {
        type: 'object',
        properties: {
          disease: { type: 'string', description: 'Likely disease or condition name' },
          confidence: { type: 'number', description: 'Confidence percentage 0-100' },
          severity: { type: 'string', enum: ['Low', 'Moderate', 'High', 'Severe', 'Healthy'] },
          symptoms: { type: 'string' },
          recommended_actions: { type: 'string' },
          prevention: { type: 'string' },
          seek_expert: { type: 'string', description: 'When to seek expert help' },
        },
        required: ['disease', 'confidence', 'severity', 'symptoms', 'recommended_actions', 'prevention'],
      },
    });

    return Response.json({ diagnosis: result });
  } catch (error) {
    return Response.json({ error: error.message || 'Analysis unavailable' }, { status: 500 });
  }
}