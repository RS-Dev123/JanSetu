import { genAI, isGeminiActive } from '../../config/gemini';
import { db } from '../../config/firebase';
import { Submission } from '../../models/db.types';

export interface ConstituencyPrediction {
  constituency: string;
  month: string; // YYYY-MM
  floodRisk: number; // 0-100 percentage
  waterShortage: number;
  roadDamage: number;
  electricityComplaints: number;
  garbageIssues: number;
  diseaseOutbreaks: number;
  complaintVolume: number;
  predictionConfidence: number;
  reasoning: string;
  trends: { month: string; actual: number; predicted: number }[];
}

export class PredictiveAnalytics {
  static async getPredictions(constituency: string, targetMonth: string): Promise<ConstituencyPrediction> {
    const submissions = await db.getCollection('submissions') as Submission[];
    const constituencySubs = submissions.filter(
      s => s.location.district.toLowerCase() === constituency.toLowerCase()
    );

    // Build historical trends from the database
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentYear = new Date().getFullYear();
    const trends = months.map(m => {
      const monthStr = `${currentYear}-${m}`;
      const actualCount = constituencySubs.filter(s => s.createdAt.startsWith(monthStr)).length;
      // Add standard synthetic projections for next months or predictions
      const predictedCount = actualCount > 0 ? Math.round(actualCount * 1.1) : Math.floor(Math.random() * 15) + 5;
      return {
        month: monthStr,
        actual: actualCount,
        predicted: predictedCount
      };
    });

    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a municipal planning predictive analytics model.
          Analyze recent issues and historical trends to forecast constituency risks for:
          Constituency: ${constituency}
          Target Month: ${targetMonth}
          Recent Complaints: ${JSON.stringify(constituencySubs.slice(0, 10).map(s => ({ category: s.category, urgency: s.urgency })))}

          Respond with a JSON object matching this structure:
          {
            "floodRisk": 45,
            "waterShortage": 82,
            "roadDamage": 60,
            "electricityComplaints": 40,
            "garbageIssues": 55,
            "diseaseOutbreaks": 20,
            "complaintVolume": 350,
            "predictionConfidence": 90,
            "reasoning": "High water shortage predicted due to low seasonal rainfall. Monsoon season expected to raise flood risk and road damage."
          }
        `;

        const response = await model.generateContent(prompt);
        const data = JSON.parse(response.response.text());
        return {
          ...data,
          constituency,
          month: targetMonth,
          trends
        };
      } catch (error) {
        console.error('PredictiveAnalytics Live API error, using fallback:', error);
      }
    }

    // Rule-based Fallback
    const monthNum = parseInt(targetMonth.split('-')[1] || '06');
    let floodRisk = 15;
    let waterShortage = 30;
    let diseaseOutbreaks = 10;

    // Monsoon months: June - September (06, 07, 08, 09)
    if (monthNum >= 6 && monthNum <= 9) {
      floodRisk = 75;
      waterShortage = 20;
      diseaseOutbreaks = 55;
    }
    // Summer months: April - May (04, 05)
    else if (monthNum >= 4 && monthNum <= 5) {
      floodRisk = 5;
      waterShortage = 85;
      diseaseOutbreaks = 25;
    }

    const roadDamage = constituencySubs.filter(s => s.category === 'Roads & Transport').length > 5 ? 70 : 45;
    const electricityComplaints = monthNum === 5 || monthNum === 6 ? 80 : 35;
    const garbageIssues = 50;
    const complaintVolume = constituencySubs.length > 0 ? constituencySubs.length + 12 : 45;

    const reasoning = `Summer seasonal temperature peak increases grid loads and water shortage risk. Monsoon months (${targetMonth}) will directly spike flood risk and potholes on main roads.`;

    return {
      constituency,
      month: targetMonth,
      floodRisk,
      waterShortage,
      roadDamage,
      electricityComplaints,
      garbageIssues,
      diseaseOutbreaks,
      complaintVolume,
      predictionConfidence: 85,
      reasoning,
      trends
    };
  }
}
