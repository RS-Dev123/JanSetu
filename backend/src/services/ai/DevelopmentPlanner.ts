import { genAI, isGeminiActive } from '../../config/gemini';

export interface PlannedProject {
  title: string;
  category: string;
  description: string;
  cost: number;
  priority: 'High' | 'Medium' | 'Low';
  department: string;
  benefits: string[];
}

export interface PlanningPhase {
  name: string;
  duration: string; // e.g. "Month 1-2"
  activities: string[];
}

export interface DevelopmentPlanResult {
  bestProjects: PlannedProject[];
  priority: string;
  executionOrder: string[];
  budgetSplit: { [category: string]: number };
  expectedBenefits: string[];
  phases: PlanningPhase[];
}

export class DevelopmentPlanner {
  static async plan(params: {
    budget: number;
    timelineMonths: number;
    departments: string[];
    district: string;
    village?: string;
    ward?: string;
    population: number;
  }): Promise<DevelopmentPlanResult> {
    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a senior government administrative advisor.
          Generate a developmental plan for the following constraints:
          District: ${params.district}
          Village/Ward: ${params.village || params.ward || 'All'}
          Budget Available: ₹${params.budget}
          Timeline Target: ${params.timelineMonths} months
          Departments: ${params.departments.join(', ')}
          Population: ${params.population}

          Respond with a JSON object matching this structure:
          {
            "bestProjects": [
              {
                "title": "Ward 4 Water Pipeline Expansion",
                "category": "Water Supply",
                "description": "Laying 4km of connection pipe for clean domestic supply.",
                "cost": 15000000,
                "priority": "High",
                "department": "Water",
                "benefits": ["Access to safe water", "Elimination of water-borne health issues"]
              }
            ],
            "priority": "High Priority",
            "executionOrder": ["Ward 4 Water Pipeline Expansion"],
            "budgetSplit": {
              "Water Supply": 15000000
            },
            "expectedBenefits": [
              "Reliable sanitation and potable drinking water.",
              "Lower administrative complaints by 35%."
            ],
            "phases": [
              { "name": "Survey & Design", "duration": "Month 1", "activities": ["Laying route survey", "Environmental permissions"] }
            ]
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as DevelopmentPlanResult;
      } catch (error) {
        console.error('DevelopmentPlanner Live API error, using fallback:', error);
      }
    }

    // Fallback logic
    const bestProjects: PlannedProject[] = [];
    const executionOrder: string[] = [];
    const budgetSplit: { [category: string]: number } = {};
    const expectedBenefits: string[] = [
      `Improves living index standards for ${params.population} citizens in ${params.district}.`,
      `Significantly lowers local travel delays and prevents road accidents.`,
      `Strengthens primary public facilities infrastructure in line with SDGs.`
    ];

    // Distribute budget
    let remainingBudget = params.budget;
    
    if (params.departments.includes('Roads') || params.departments.includes('PWD')) {
      const roadCost = Math.min(remainingBudget, 25000000); // 2.5 Cr max
      if (roadCost > 0) {
        bestProjects.push({
          title: `Road Network Pothole Repair & Widening`,
          category: 'Roads & Transport',
          description: `Comprehensive road leveling, paving, and gutter installation in ${params.village || params.district}.`,
          cost: roadCost,
          priority: 'High',
          department: 'PWD',
          benefits: ['Reduces local transit times by 30%', 'Enhances access to main highway links']
        });
        executionOrder.push('Road Network Pothole Repair & Widening');
        budgetSplit['Roads & Transport'] = roadCost;
        remainingBudget -= roadCost;
      }
    }

    if (remainingBudget > 0 && (params.departments.includes('Water') || params.departments.includes('PHED'))) {
      const waterCost = Math.min(remainingBudget, 15000000); // 1.5 Cr max
      if (waterCost > 0) {
        bestProjects.push({
          title: `Community Drinking Water Plant & Pipelines`,
          category: 'Water Supply',
          description: `Constructing dual solar-operated wells with high-capacity filters.`,
          cost: waterCost,
          priority: 'High',
          department: 'Water',
          benefits: ['Provides safe water to all households', 'Drastically decreases seasonal waterborne disease']
        });
        executionOrder.push('Community Drinking Water Plant & Pipelines');
        budgetSplit['Water Supply'] = waterCost;
        remainingBudget -= waterCost;
      }
    }

    // Default other project if budget remains
    if (remainingBudget > 0 && bestProjects.length === 0) {
      bestProjects.push({
        title: `General Public Infrastructure Upgrade`,
        category: 'Public Spaces',
        description: `Upgrading local municipal facilities, lighting, and sanitation.`,
        cost: remainingBudget,
        priority: 'Medium',
        department: 'Municipality',
        benefits: ['Improves cleanliness index', 'Reduces public safety incidents']
      });
      executionOrder.push('General Public Infrastructure Upgrade');
      budgetSplit['Public Spaces'] = remainingBudget;
    }

    const phases = [
      { name: 'Phase 1: Tender & Procurement', duration: 'Month 1', activities: ['Finalizing project specs', 'Opening public tenders'] },
      { name: 'Phase 2: Core Construction', duration: 'Month 2-4', activities: ['Civil engineering work', 'Laying foundation/pipes'] },
      { name: 'Phase 3: Quality Check & Handover', duration: 'Month 5', activities: ['Safety inspections', 'Connecting local nodes', 'Citizen feedback survey'] }
    ];

    return {
      bestProjects,
      priority: 'High Priority',
      executionOrder,
      budgetSplit,
      expectedBenefits,
      phases
    };
  }
}
