import { genAI, isGeminiActive } from '../../../config/gemini';
import { PriorityScoreOutput } from './agent.types';

export const runPriorityAgent = async (
  category: string,
  urgency: 'low' | 'medium' | 'high' | 'critical',
  duplicateCount: number,
  gapDetails: string
): Promise<PriorityScoreOutput> => {
  if (isGeminiActive && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `
        You are a priority evaluator agent in a government project planner app.
        Calculate the priority score, infrastructure gap index (0-10), and estimated affected population.
        Output a JSON object matching this structure:
        {
          "priorityScore": 75,
          "infrastructureGapIndex": 6,
          "affectedPopulation": 1200,
          "reasoning": "Specify the calculation steps: e.g. base score, duplicate multiplier, and infrastructural gap weights.",
          "confidence": 95
        }

        Input parameters:
        - Category: ${category}
        - Urgency Level: ${urgency}
        - Duplicate Count (number of similar complaints): ${duplicateCount}
        - District Infrastructure Gaps: ${gapDetails}
      `;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as PriorityScoreOutput;
    } catch (error) {
      console.error('Priority Agent Live API Error, using fallback:', error);
    }
  }

  // Formula-based local priority calculator
  let baseScore = 30;
  if (urgency === 'critical') baseScore = 80;
  else if (urgency === 'high') baseScore = 60;
  else if (urgency === 'medium') baseScore = 40;

  // Multiplier for duplicate count
  const duplicateMultiplier = Math.min(20, duplicateCount * 3);
  
  // Gap analysis base
  const gapIndex = gapDetails.includes(category) ? 8 : 4;
  const gapWeight = gapIndex * 1.5;

  const finalScore = Math.min(100, baseScore + duplicateMultiplier + gapWeight);
  const affectedPopulation = 250 + (duplicateCount * 180);

  const reasoning = `Base score of ${baseScore} (urgency: ${urgency.toUpperCase()}) was combined with a duplicate multiplier of +${duplicateMultiplier} (${duplicateCount} similar tickets) and an infrastructure gap weighting of +${gapWeight} (Index: ${gapIndex}/10). Final Priority Score calculated: ${finalScore}/100.`;

  return {
    priorityScore: Math.round(finalScore),
    infrastructureGapIndex: gapIndex,
    affectedPopulation,
    reasoning,
    confidence: 90
  };
};
