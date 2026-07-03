import { genAI, isGeminiActive } from '../../config/gemini';

export interface BudgetAllocation {
  category: string;
  amount: number; // in Rupees
  reasoning: string;
  populationBenefited: number;
  expectedComplaintsReducedPercent: number;
}

export interface BudgetOptimizationResult {
  allocations: BudgetAllocation[];
  remainingBudget: number;
  totalPopulationBenefited: number;
  overallImpactScore: number; // 0-100
  recommendations: string[];
}

export class BudgetOptimizer {
  static async optimize(
    totalBudget: number, // In Rupees
    constituency: string,
    categoriesList: string[] = ['Roads & Transport', 'Water Supply', 'Sanitation & Waste', 'Education', 'Healthcare', 'Electricity & Power']
  ): Promise<BudgetOptimizationResult> {
    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a government budget optimization AI advisor.
          Allocate the total budget of ₹${totalBudget} (in Rupees) across the following categories to resolve citizen issues in the constituency of ${constituency}:
          Categories: ${categoriesList.join(', ')}

          Respond with a JSON object matching this structure:
          {
            "allocations": [
              {
                "category": "Roads & Transport",
                "amount": 20000000,
                "reasoning": "High volume of road complaints near schools.",
                "populationBenefited": 18200,
                "expectedComplaintsReducedPercent": 42
              }
            ],
            "remainingBudget": 5000000,
            "totalPopulationBenefited": 35000,
            "overallImpactScore": 88,
            "recommendations": [
              "Prioritize pothole repairs before water pipeline laying.",
              "Reserve 10% budget for monsoon damage contingencies."
            ]
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as BudgetOptimizationResult;
      } catch (error) {
        console.error('BudgetOptimizer Live API error, using fallback:', error);
      }
    }

    // Fallback: Formula-based budget splitter
    const allocations: BudgetAllocation[] = [];
    let remainingBudget = totalBudget;

    // Rule-based splits for ₹5 Crore standard
    // Road: 40%, Water: 25%, Education: 15%, Waste: 10%, Electricity: 10%
    const templates: Record<string, { pct: number; pop: number; red: number; reason: string }> = {
      'Roads & Transport': { pct: 0.40, pop: 18200, red: 42, reason: 'Reconstruct main arterial highways and repair village link roads.' },
      'Water Supply': { pct: 0.25, pop: 12500, red: 35, reason: 'Install community filtration systems and replace rusted pipelines.' },
      'Education': { pct: 0.15, pop: 6000, red: 20, reason: 'Upgrade sanitization blocks in government schools and restore roofs.' },
      'Sanitation & Waste': { pct: 0.10, pop: 4500, red: 25, reason: 'Initiate door-to-door waste sorting bins and clear secondary drains.' },
      'Electricity & Power': { pct: 0.08, pop: 8000, red: 15, reason: 'Erect energy-efficient solar street lights at high-crime crossings.' },
      'Healthcare': { pct: 0.02, pop: 3000, red: 10, reason: 'Augment emergency drug availability in primary health centers.' }
    };

    let totalPopBenefited = 0;
    let sumImpact = 0;
    let allocatedCount = 0;

    for (const cat of categoriesList) {
      const template = templates[cat];
      if (template && remainingBudget > 0) {
        const amt = Math.floor(totalBudget * template.pct);
        if (remainingBudget >= amt) {
          allocations.push({
            category: cat,
            amount: amt,
            reasoning: template.reason,
            populationBenefited: template.pop,
            expectedComplaintsReducedPercent: template.red
          });
          remainingBudget -= amt;
          totalPopBenefited += template.pop;
          sumImpact += template.red;
          allocatedCount++;
        }
      }
    }

    const overallImpactScore = allocatedCount > 0 ? Math.round((sumImpact / (allocatedCount * 45)) * 100) : 50;

    const recommendations = [
      `Distribute standard MPLADS and state funds following a 40-30-20 ratio.`,
      `Leverage central government schemes (e.g. Jal Jeevan Mission) to cover additional water piping costs.`,
      `Conduct pre-work inspections before dispersing contractors' first installments.`
    ];

    return {
      allocations,
      remainingBudget,
      totalPopulationBenefited: totalPopBenefited,
      overallImpactScore: Math.min(100, overallImpactScore),
      recommendations
    };
  }
}
