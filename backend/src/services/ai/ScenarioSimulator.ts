import { genAI, isGeminiActive } from '../../config/gemini';

export interface SimulationResult {
  budgetRequired: number; // in Rupees
  timelineMonths: number;
  populationHelped: number;
  complaintReductionPercent: number;
  economicImpact: 'High' | 'Medium' | 'Low' | 'Very High';
  travelReductionPercent: number;
  educationImprovementPercent: number;
  waterAccessImprovementPercent: number;
  healthAccessImprovementPercent: number;
  reasoning: string;
}

export class ScenarioSimulator {
  static async simulate(inputs: {
    schools: number;
    roads: number;
    bridges: number;
    solarPlants: number;
    waterTanks: number;
  }): Promise<SimulationResult> {
    const { schools, roads, bridges, solarPlants, waterTanks } = inputs;

    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a municipal simulation engine.
          Calculate the societal impact and cost of building the following items:
          Schools: ${schools}
          Roads (km): ${roads}
          Bridges: ${bridges}
          Solar Plants: ${solarPlants}
          Water Tanks: ${waterTanks}

          Respond with a JSON object matching this structure:
          {
            "budgetRequired": 75000000,
            "timelineMonths": 8,
            "populationHelped": 28000,
            "complaintReductionPercent": 65,
            "economicImpact": "High",
            "travelReductionPercent": 35,
            "educationImprovementPercent": 40,
            "waterAccessImprovementPercent": 50,
            "healthAccessImprovementPercent": 15,
            "reasoning": "High road construction speeds travel. Schools increase educational accessibility. Water tanks resolve water shortage."
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as SimulationResult;
      } catch (error) {
        console.error('ScenarioSimulator Live API error, using fallback:', error);
      }
    }

    // Fallback Calculation
    const schoolCost = schools * 15000000; // 1.5 Cr each
    const roadCost = roads * 5000000;      // 50 Lakhs per km
    const bridgeCost = bridges * 40000000;  // 4 Cr each
    const solarCost = solarPlants * 1000000; // 10 Lakhs each
    const waterCost = waterTanks * 1500000;  // 15 Lakhs each

    const budgetRequired = schoolCost + roadCost + bridgeCost + solarCost + waterCost;
    
    // Projections
    const timelineMonths = Math.max(3, Math.min(24, Math.round(schools * 2 + roads * 0.5 + bridges * 4 + waterTanks * 0.8)));
    const populationHelped = (schools * 1500) + (roads * 2500) + (bridges * 8000) + (solarPlants * 1200) + (waterTanks * 2000);
    const complaintReductionPercent = Math.min(95, Math.round((schools * 4 + roads * 6 + bridges * 8 + waterTanks * 7 + solarPlants * 3)));
    
    const travelReductionPercent = Math.min(80, roads * 8 + bridges * 15);
    const educationImprovementPercent = Math.min(85, schools * 12);
    const waterAccessImprovementPercent = Math.min(90, waterTanks * 14);
    const healthAccessImprovementPercent = Math.min(75, bridges * 6 + solarPlants * 2);

    const economicImpact = budgetRequired > 50000000 ? 'Very High' : budgetRequired > 20000000 ? 'High' : 'Medium';

    const reasoning = `Simulated scenario indicates that building ${roads}km roads and ${bridges} bridges would reduce transit latency by ${travelReductionPercent}%. Deploying ${waterTanks} water reservoirs serves ${waterAccessImprovementPercent}% more households with safe drinking tap supply. Total simulated budget is ₹${(budgetRequired / 10000000).toFixed(2)} Crore.`;

    return {
      budgetRequired,
      timelineMonths,
      populationHelped,
      complaintReductionPercent: complaintReductionPercent || 15,
      economicImpact,
      travelReductionPercent,
      educationImprovementPercent,
      waterAccessImprovementPercent,
      healthAccessImprovementPercent,
      reasoning
    };
  }
}
