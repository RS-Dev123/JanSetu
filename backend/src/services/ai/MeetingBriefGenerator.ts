import { genAI, isGeminiActive } from '../../config/gemini';
import { db } from '../../config/firebase';
import { Submission, Recommendation } from '../../models/db.types';

export interface MeetingBrief {
  type: 'daily' | 'weekly' | 'monthly';
  constituency: string;
  generatedAt: string;
  topIssues: { title: string; count: number; category: string }[];
  urgentVillages: { name: string; priorityScore: number; complaintCount: number }[];
  budgetSummary: { totalAllocated: number; totalSpent: number; remaining: number };
  recommendations: string[];
  predictions: string[];
  executiveSummary: string;
}

export class MeetingBriefGenerator {
  static async generateBrief(
    constituency: string,
    type: 'daily' | 'weekly' | 'monthly'
  ): Promise<MeetingBrief> {
    const submissions = await db.getCollection('submissions') as Submission[];
    const constituencySubs = submissions.filter(
      s => s.location.district.toLowerCase() === constituency.toLowerCase()
    );

    const recs = await db.getCollection('recommendations') as Recommendation[];
    const constituencyRecs = recs.filter(
      r => r.constituency.toLowerCase() === constituency.toLowerCase()
    );

    // Heuristics for aggregate statistics
    const topIssuesMap: Record<string, { count: number; category: string }> = {};
    for (const sub of constituencySubs) {
      const key = sub.category;
      if (!topIssuesMap[key]) {
        topIssuesMap[key] = { count: 0, category: key };
      }
      topIssuesMap[key].count++;
    }
    const topIssues = Object.values(topIssuesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({ title: `${item.category} Upgrades`, count: item.count, category: item.category }));

    const villageMap: Record<string, { prioritySum: number; count: number }> = {};
    for (const sub of constituencySubs) {
      const name = sub.location.village || sub.location.ward || 'General Area';
      if (!villageMap[name]) {
        villageMap[name] = { prioritySum: 0, count: 0 };
      }
      villageMap[name].prioritySum += sub.priorityScore || 50;
      villageMap[name].count++;
    }
    const urgentVillages = Object.entries(villageMap)
      .map(([name, val]) => ({
        name,
        priorityScore: Math.round(val.prioritySum / val.count),
        complaintCount: val.count
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);

    const totalAllocated = constituencyRecs.reduce((acc, r) => acc + (r.estimatedBudget || 0), 0);
    const totalSpent = constituencyRecs
      .filter(r => r.status === 'implemented')
      .reduce((acc, r) => acc + (r.estimatedBudget || 0), 0);
    const remaining = totalAllocated - totalSpent;

    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a senior advisor to a Member of Parliament (MP).
          Draft a ${type} executive constituency briefing summary for:
          Constituency: ${constituency}
          Top Issues: ${JSON.stringify(topIssues)}
          Urgent Villages: ${JSON.stringify(urgentVillages)}
          Allocated Budget: ₹${totalAllocated}

          Respond with a JSON object matching this structure:
          {
            "recommendations": [
              "Approve the Village Water pipeline for ward 4 immediately.",
              "Convene a PWD Pothole inspection before monsoon floods start."
            ],
            "predictions": [
              "Rainfall next month will increase road traffic delays by 22% in North Ward.",
              "Arsenic levels in well 5 will exceed safety margin by August."
            ],
            "executiveSummary": "A concise 3-4 sentence advisor summary overviewing constituency concerns and action points."
          }
        `;

        const response = await model.generateContent(prompt);
        const data = JSON.parse(response.response.text());
        return {
          type,
          constituency,
          generatedAt: new Date().toISOString(),
          topIssues,
          urgentVillages,
          budgetSummary: { totalAllocated, totalSpent, remaining },
          recommendations: data.recommendations,
          predictions: data.predictions,
          executiveSummary: data.executiveSummary
        };
      } catch (error) {
        console.error('MeetingBriefGenerator Live API error, using fallback:', error);
      }
    }

    // Fallback Mock Responses
    const recommendations = [
      `Expedite construction approval of PHED water tanks in ${urgentVillages[0]?.name || 'East Ward'}.`,
      `Sanction road link repair funds under PMGSY schemes for high-traffic zones.`
    ];
    const predictions = [
      `Monsoon rainfall is forecast to increase drainage complaints in low-lying village blocks.`,
      `Estimated water scarcity warning flags raised for 3 village clusters next season.`
    ];
    const executiveSummary = `This is the ${type} constituency briefing summary for ${constituency}. Recent citizen submissions emphasize ${topIssues[0]?.title || 'infrastructure'} issues, with ${urgentVillages[0]?.name || 'Ward 1'} requiring immediate intervention. Financial sheets show ₹${(totalAllocated / 10000000).toFixed(2)} Crore committed, with ₹${(remaining / 10000000).toFixed(2)} Crore currently unliquidated.`;

    return {
      type,
      constituency,
      generatedAt: new Date().toISOString(),
      topIssues,
      urgentVillages,
      budgetSummary: { totalAllocated, totalSpent, remaining },
      recommendations,
      predictions,
      executiveSummary
    };
  }
}
