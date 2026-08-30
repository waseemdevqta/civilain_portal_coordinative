const { GoogleGenAI } = require('@google/genai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Generate a short 3-5 sentence operational briefing for government officers based solely on aggregated statistics.
 * @param {Object} stats - Aggregated complaints statistics
 * @returns {Promise<string>} - The briefing text
 */
const generateOfficerBriefing = async (stats) => {
  const client = getGeminiClient();

  if (!client) {
    const error = new Error('Gemini AI is not configured. Please set a valid GEMINI_API_KEY in the environment.');
    error.statusCode = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const systemInstruction = `You are a concise civic operations assistant. Based only on the provided complaint statistics, write a short 3–5 sentence briefing for a government officer. Highlight the most important workload, high-priority issues, and problem areas. Do not invent facts. Do not make political claims. Do not identify individual citizens.`;

  const prompt = `${systemInstruction}\n\nAggregated Operational Data:\n${JSON.stringify(stats, null, 2)}`;

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });

    if (!response || !response.text) {
      throw new Error('Empty response received from Gemini API');
    }

    return response.text.trim();
  } catch (err) {
    if (err.statusCode === 503) {
      throw err;
    }
    console.error('[Gemini API Error]:', err.message);
    const error = new Error(`Failed to generate AI briefing: ${err.message}`);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = {
  getGeminiClient,
  generateOfficerBriefing,
};
