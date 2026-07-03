import { genAI, isGeminiActive } from '../../../config/gemini';
import { SentimentUrgencyOutput } from './agent.types';

export const runSentimentAgent = async (translatedText: string): Promise<SentimentUrgencyOutput> => {
  if (isGeminiActive && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `
        You are a policy analyst agent. Analyze the sentiment and determine the urgency of this complaint.
        Output a JSON object matching this structure:
        {
          "sentiment": "positive" | "neutral" | "negative",
          "urgency": "low" | "medium" | "high" | "critical",
          "urgencyReasoning": "Explain the decision based on safety hazards, number of affected people, or health risks.",
          "evidence": ["Key fact 1 extracted from text", "Key fact 2"],
          "confidence": 90
        }

        Complaint text:
        """
        ${translatedText}
        """
      `;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as SentimentUrgencyOutput;
    } catch (error) {
      console.error('Sentiment Agent Live API Error, using fallback:', error);
    }
  }

  // Heuristic mock analyser
  const text = translatedText.toLowerCase();
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let reasoning = 'Standard request for maintenance or development.';
  const evidence: string[] = [];

  if (text.includes('accident') || text.includes('hazard') || text.includes('danger') || text.includes('injury')) {
    urgency = 'critical';
    reasoning = 'Presents immediate safety hazard or threat of bodily injury.';
    evidence.push('Direct reference to safety threats and accidents.');
  } else if (text.includes('emergency') || text.includes('no water') || text.includes('disease') || text.includes('flooding')) {
    urgency = 'high';
    reasoning = 'Severe impact on health, sanitation, or basic utility supply.';
    evidence.push('Reference to disruption of vital resource supply.');
  } else if (text.includes('broken') || text.includes('potholes') || text.includes('dirty')) {
    urgency = 'medium';
    reasoning = 'Substandard infrastructure or environmental decay.';
    evidence.push('Infrastructure requires active maintenance.');
  } else {
    urgency = 'low';
    reasoning = 'General request for improvement with no immediate health or safety implications.';
    evidence.push('Minor cosmetic or service suggestion.');
  }

  return {
    sentiment: text.includes('thank') ? 'positive' : 'negative',
    urgency,
    urgencyReasoning: reasoning,
    evidence,
    confidence: 85
  };
};
