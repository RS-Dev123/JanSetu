import { genAI, isGeminiActive } from '../../config/gemini';
import { db } from '../../config/firebase';
import { Submission } from '../../models/db.types';

export interface PriorityReport {
  priorityScore: number; // 0-100
  confidence: number;    // 0-100
  expectedImpact: 'Low' | 'Medium' | 'High' | 'Very High';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedCost: number; // in Rupees
  estimatedCompletion: string; // e.g. "6 Months"
  populationBenefited: number;
  rank: number;
  reasoning: string[];
}

export class PriorityRankingEngine {
  /**
   * Generates a complete priority report for a complaint/submission or recommendation.
   */
  static async generatePriorityReport(submissionId: string): Promise<PriorityReport> {
    const submission = await db.getDoc('submissions', submissionId) as Submission | null;
    if (!submission) {
      return this.getDefaultReport();
    }

    const { category, urgency, location } = submission;
    const desc = submission.description;
    
    // Fetch all submissions to determine ranking
    const allSubmissions = await db.getCollection('submissions') as Submission[];
    // Simple heuristic ranking: sort by existing priorityScore descending
    const sortedSubs = [...allSubmissions].sort((a, b) => b.priorityScore - a.priorityScore);
    const rawRank = sortedSubs.findIndex(s => s.id === submissionId) + 1;
    const finalRank = rawRank > 0 ? rawRank : sortedSubs.length + 1;

    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are the lead engine evaluator. Perform priority ranking assessment on the following complaint:
          Title: ${submission.title}
          Category: ${category}
          Urgency: ${urgency}
          Description: ${desc}
          Location: ${location.village || location.ward || 'General'}, ${location.district}, ${location.state}
          
          Respond with a JSON object matching this structure:
          {
            "priorityScore": 95,
            "confidence": 98,
            "expectedImpact": "Very High",
            "risk": "Medium",
            "estimatedCost": 25000000,
            "estimatedCompletion": "6 Months",
            "populationBenefited": 18200,
            "reasoning": [
              "Road condition is poor causing severe travel delays",
              "Primary school nearby is affected",
              "Hospital connectivity is degraded",
              "High complaint frequency in this ward",
              "Constituency budget is feasible"
            ]
          }
        `;

        const response = await model.generateContent(prompt);
        const data = JSON.parse(response.response.text());
        return {
          ...data,
          rank: finalRank
        };
      } catch (error) {
        console.error('PriorityRankingEngine Live API error, using fallback:', error);
      }
    }

    // Rule-based Fallback
    let priorityScore = submission.priorityScore || 75;
    let confidence = submission.confidenceScore || 85;
    let expectedImpact: PriorityReport['expectedImpact'] = 'High';
    let risk: PriorityReport['risk'] = 'Medium';
    let estimatedCost = 500000; // default 5 Lakhs
    let estimatedCompletion = '3 Months';
    let populationBenefited = 500;

    // Category based adjustments
    if (category === 'Roads & Transport') {
      estimatedCost = 25000000; // 2.5 Cr
      estimatedCompletion = '6 Months';
      populationBenefited = 18200;
      expectedImpact = 'Very High';
      risk = 'Medium';
    } else if (category === 'Water Supply') {
      estimatedCost = 15000000; // 1.5 Cr
      estimatedCompletion = '4 Months';
      populationBenefited = 12500;
      expectedImpact = 'Very High';
      risk = 'High';
    } else if (category === 'Sanitation & Waste') {
      estimatedCost = 3500000; // 35 Lakhs
      estimatedCompletion = '2 Months';
      populationBenefited = 4500;
      expectedImpact = 'Medium';
      risk = 'Low';
    } else if (category === 'Healthcare') {
      estimatedCost = 20000000; // 2 Cr
      estimatedCompletion = '5 Months';
      populationBenefited = 15000;
      expectedImpact = 'Very High';
      risk = 'High';
    }

    const reasoning = [
      `Urgency level detected is ${urgency.toUpperCase()}.`,
      `Estimated budget is ₹${(estimatedCost / 10000000).toFixed(2)} Crore based on ${category} standard templates.`,
      `Directly benefits rural and urban connectivity networks.`,
      `Addresses infrastructure gaps in the ${location.district} development plan.`,
      `Public satisfaction index expected to rise by ${(priorityScore / 2).toFixed(0)}%.`
    ];

    return {
      priorityScore,
      confidence,
      expectedImpact,
      risk,
      estimatedCost,
      estimatedCompletion,
      populationBenefited,
      rank: finalRank,
      reasoning
    };
  }

  private static getDefaultReport(): PriorityReport {
    return {
      priorityScore: 50,
      confidence: 80,
      expectedImpact: 'Medium',
      risk: 'Medium',
      estimatedCost: 1000000,
      estimatedCompletion: '3 Months',
      populationBenefited: 1000,
      rank: 99,
      reasoning: ['Default template report: submission not found.']
    };
  }
}
