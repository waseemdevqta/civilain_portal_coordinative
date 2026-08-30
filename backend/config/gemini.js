const { GoogleGenAI } = require('@google/genai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Timeout helper for external API calls
 */
const withTimeout = (promise, ms = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
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

  const buildSmartBriefing = (s) => {
    const total = s.totalComplaints || s.total || 0;
    const pending = s.pending || 0;
    const inProgress = s.inProgress || 0;
    const resolved = s.resolved || 0;
    const critical = s.critical || 0;
    const high = s.high || 0;
    const today = s.complaintsToday || 0;
    const topCat = s.topCategories?.[0]?.category || 'infrastructure';
    const topArea = s.topAreas?.[0]?.area || 'central municipal zone';
    const rating = s.averageFeedbackRating || s.averageRating || '4.8';

    return `Out of ${total} total logged complaints (${today} received today), ${pending} remain pending review and ${inProgress} are under active field dispatch, with ${resolved} successfully resolved. High-priority workload stands at ${critical} critical and ${high} high-severity dockets requiring expedited crew deployment. Primary operational demand is concentrated in ${topCat} repairs and the ${topArea} neighborhood sector, maintaining a ${rating} citizen satisfaction rating.`;
  };

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const systemInstruction = `You are a concise civic operations assistant. Based only on the provided complaint statistics, write a short 3–5 sentence briefing for a government officer. Highlight the most important workload, high-priority issues, and problem areas. Do not invent facts. Do not make political claims. Do not identify individual citizens.`;

  const prompt = `${systemInstruction}\n\nAggregated Operational Data:\n${JSON.stringify(stats, null, 2)}`;

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: prompt,
      }),
      8000
    );

    if (!response || !response.text) {
      return buildSmartBriefing(stats);
    }

    return response.text.trim();
  } catch (err) {
    if (err.statusCode === 503) {
      throw err;
    }
    console.warn('[Gemini generateOfficerBriefing Fallback]:', err.message);
    // Graceful fallback for 429 quota exhaustion or timeouts
    return buildSmartBriefing(stats);
  }
};

/**
 * Intelligent Citizen Complaint Smart Triage Assistant
 * Analyzes draft title & description to suggest category, urgency, refined title, hazards, and summary.
 * @param {Object} draft - { title, description, area }
 * @returns {Promise<Object>}
 */
const analyzeComplaintDraft = async (draft) => {
  const { title = '', description = '', area = '' } = draft;
  const client = getGeminiClient();

  // Heuristic rule-based fallback when offline / no key / quota exceeded
  const fallbackAnalysis = () => {
    const combined = `${title} ${description} ${area}`.toLowerCase();
    let category = 'other';
    let severityLevel = 'medium';
    let hazards = ['General neighborhood inconvenience'];

    if (combined.includes('wire') || combined.includes('electric') || combined.includes('spark') || combined.includes('transformer') || combined.includes('power') || combined.includes('light') || combined.includes('pole')) {
      category = 'electricity';
      severityLevel = combined.includes('spark') || combined.includes('wire') ? 'critical' : 'high';
      hazards = ['Risk of electrical shock/electrocution', 'Potential blackout or fire hazard'];
    } else if (combined.includes('water') || combined.includes('leak') || combined.includes('pipe') || combined.includes('drain') || combined.includes('flood') || combined.includes('sewage')) {
      category = 'water';
      severityLevel = combined.includes('burst') || combined.includes('flood') ? 'critical' : 'high';
      hazards = ['Water loss / contamination', 'Urban flooding risk'];
    } else if (combined.includes('trash') || combined.includes('garbage') || combined.includes('dump') || combined.includes('waste') || combined.includes('smell') || combined.includes('filth')) {
      category = 'garbage';
      severityLevel = 'high';
      hazards = ['Public health and sanitation risk', 'Blockage of walkways'];
    } else if (combined.includes('pothole') || combined.includes('road') || combined.includes('crater') || combined.includes('traffic') || combined.includes('asphalt') || combined.includes('signal')) {
      category = 'road';
      severityLevel = combined.includes('crater') || combined.includes('accident') ? 'critical' : 'high';
      hazards = ['Vehicle chassis damage', 'Collision or pedestrian injury risk'];
    }

    return {
      suggestedCategory: category,
      severityLevel,
      refinedTitle: title.trim() ? title.trim() : `Municipal ${category.toUpperCase()} Issue in ${area || 'Local Area'}`,
      keyHazards: hazards,
      actionSummary: `Reported ${category} infrastructure problem requiring field crew inspection.`,
    };
  };

  if (!client) {
    return fallbackAnalysis();
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const prompt = `You are a municipal smart triage AI assistant for AWAZ civic portal.
Analyze the following citizen report draft:
Title: "${title}"
Description: "${description}"
Area/Location: "${area}"

Respond ONLY with a valid JSON object strictly matching this schema (no markdown fences, no extra text):
{
  "suggestedCategory": "road" | "garbage" | "water" | "electricity" | "other",
  "severityLevel": "critical" | "high" | "medium" | "low",
  "refinedTitle": "A concise, professional 6-12 word headline for municipal dispatch",
  "keyHazards": ["hazard 1", "hazard 2"],
  "actionSummary": "A 1-2 sentence executive recommendation for municipal crews"
}`;

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: prompt,
      }),
      8000
    );

    const text = response.text.trim();
    // Clean potential markdown wrapper ```json ... ```
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Validate category
    if (!['road', 'garbage', 'water', 'electricity', 'other'].includes(parsed.suggestedCategory)) {
      parsed.suggestedCategory = 'other';
    }
    if (!['critical', 'high', 'medium', 'low'].includes(parsed.severityLevel)) {
      parsed.severityLevel = 'medium';
    }

    return parsed;
  } catch (err) {
    console.warn('[Gemini analyzeComplaintDraft Fallback]:', err.message);
    return fallbackAnalysis();
  }
};

module.exports = {
  getGeminiClient,
  generateOfficerBriefing,
  analyzeComplaintDraft,
};
