import { genAI, isGeminiActive } from '../../config/gemini';

export interface RiskReport {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  factors: { factor: string; riskWeight: number; mitigation: string }[];
  summary: string;
}

export class RiskAssessmentEngine {
  static async assessRisk(
    title: string,
    category: string,
    estimatedCost: number,
    timeline: string
  ): Promise<RiskReport> {
    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a project manager risk assessor.
          Assess the risk of this constituency development project:
          Title: ${title}
          Category: ${category}
          Estimated Cost: ₹${estimatedCost}
          Timeline: ${timeline}

          Respond with a JSON object matching this structure:
          {
            "riskLevel": "Medium",
            "confidence": 95,
            "factors": [
              { "factor": "Monsoon Weather delays", "riskWeight": 65, "mitigation": "Schedule earthworks outside wet seasons." },
              { "factor": "Land ownership clearances", "riskWeight": 40, "mitigation": "Validate municipal boundary coordinates early." }
            ],
            "summary": "Project risk is low to medium, primarily driven by standard municipal administrative clearances."
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as RiskReport;
      } catch (error) {
        console.error('RiskAssessmentEngine Live API error, using fallback:', error);
      }
    }

    // Fallback logic
    let riskLevel: RiskReport['riskLevel'] = 'Low';
    if (estimatedCost > 20000000) {
      riskLevel = 'High';
    } else if (estimatedCost > 5000000) {
      riskLevel = 'Medium';
    }

    const factors = [
      {
        factor: 'Monsoon Flooding & Weather delays',
        riskWeight: category === 'Roads & Transport' ? 70 : 40,
        mitigation: 'Schedule grading and outdoor structural pours during dry winter months.'
      },
      {
        factor: 'Public Utility Disruption during digging',
        riskWeight: category === 'Water Supply' ? 60 : 30,
        mitigation: 'Map existing local electrical cables and telephone conduits before excavation.'
      }
    ];

    const summary = `Overall execution risk level is graded as ${riskLevel.toUpperCase()}. The principal hazard is weather dependencies (especially for roads/water piping) and municipal coordination.`;

    return {
      riskLevel,
      confidence: 85,
      factors,
      summary
    };
  }
}
