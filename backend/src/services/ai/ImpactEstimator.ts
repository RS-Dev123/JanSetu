import { genAI, isGeminiActive } from '../../config/gemini';

export interface BeforeAfterImpact {
  currentComplaints: number;
  predictedComplaints: number;
  budgetSaved: number; // in Rupees
  travelTimeReducedPercent: number;
  citizensBenefited: number;
  completionTimeline: string;
  overallImpactScore: number; // 0-100
  reasoning: string;
}

export class ImpactEstimator {
  static async estimateImpact(
    title: string,
    category: string,
    estimatedCost: number,
    villageOrWard: string
  ): Promise<BeforeAfterImpact> {
    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a municipal socio-economic impact engine.
          Predict the before-and-after change if the following project is completed in ${villageOrWard}:
          Title: ${title}
          Category: ${category}
          Estimated Cost: ₹${estimatedCost}

          Respond with a JSON object matching this structure:
          {
            "currentComplaints": 42,
            "predictedComplaints": 3,
            "budgetSaved": 500000,
            "travelTimeReducedPercent": 35,
            "citizensBenefited": 18200,
            "completionTimeline": "6 Months",
            "overallImpactScore": 92,
            "reasoning": "Replacing degraded road links resolves high vehicle wear costs and travel delays."
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as BeforeAfterImpact;
      } catch (error) {
        console.error('ImpactEstimator Live API error, using fallback:', error);
      }
    }

    // Rule-based Fallback
    let currentComplaints = 15;
    let predictedComplaints = 2;
    let budgetSaved = 150000;
    let travelTimeReducedPercent = 10;
    let citizensBenefited = 1200;
    let completionTimeline = '3 Months';
    let overallImpactScore = 75;

    if (category === 'Roads & Transport') {
      currentComplaints = 42;
      predictedComplaints = 4;
      budgetSaved = 450000;
      travelTimeReducedPercent = 40;
      citizensBenefited = 18200;
      completionTimeline = '6 Months';
      overallImpactScore = 95;
    } else if (category === 'Water Supply') {
      currentComplaints = 35;
      predictedComplaints = 2;
      budgetSaved = 250000;
      travelTimeReducedPercent = 5; // not travel related
      citizensBenefited = 12500;
      completionTimeline = '4 Months';
      overallImpactScore = 90;
    }

    const reasoning = `Completion of ${title} resolves standard service issues, moving complaint levels from ${currentComplaints} to a forecasted ${predictedComplaints}.`;

    return {
      currentComplaints,
      predictedComplaints,
      budgetSaved,
      travelTimeReducedPercent,
      citizensBenefited,
      completionTimeline,
      overallImpactScore,
      reasoning
    };
  }
}
