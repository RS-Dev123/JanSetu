import { db } from '../config/firebase';
import { Submission, Recommendation, PublicDataset } from '../models/db.types';
import { ragService } from './rag/rag.service';
import { genAI, isGeminiActive } from '../config/gemini';

export const generateConstituencyRecommendations = async (constituency: string): Promise<Recommendation[]> => {
  try {
    const submissions = await db.getCollection('submissions') as Submission[];
    const constituencySubs = submissions.filter(
      s => s.location.district.toLowerCase() === constituency.toLowerCase() && s.status === 'pending'
    );

    if (constituencySubs.length === 0) {
      console.log('No pending submissions found to generate recommendations.');
      return [];
    }

    // Group submissions by category + village/ward
    const groups: Record<string, Submission[]> = {};
    for (const sub of constituencySubs) {
      const key = `${sub.category}_${sub.location.village || sub.location.ward || 'General'}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(sub);
    }

    const generatedRecs: Recommendation[] = [];

    // Fetch Public Gaps
    const datasets = await db.getCollection('publicDatasets') as PublicDataset[];
    const publicData = datasets.find(d => d.constituency.toLowerCase() === constituency.toLowerCase()) || {
      constituency,
      population: 450000,
      roadDensity: 1.2,
      waterAvailability: 65,
      electricityAvailability: 85,
      schoolsCount: 45,
      hospitalsCount: 8,
      gaps: {
        waterSupply: ['Borewell failures', 'High arsenic levels'],
        healthcare: ['Lack of CHCs in rural wards'],
        schools: ['Separate toilet backlogs'],
        roads: ['Broken feeder link roads']
      },
      hospitalLocations: [],
      schoolLocations: [],
      roadLocations: [],
      waterLocations: []
    };

    for (const [groupKey, groupSubs] of Object.entries(groups)) {
      const sampleSub = groupSubs[0];
      const category = sampleSub.category;
      const region = sampleSub.location.village || sampleSub.location.ward || 'Constituency Area';

      // 1. Retrieve RAG Policy Documents
      const queryText = groupSubs.map(s => s.description).join(' ');
      const citations = await ragService.queryKnowledgeBase(queryText, category);
      const citationTitles = citations.map(c => `${c.title} (${c.source})`);

      // Compute aggregates
      const avgPriority = Math.round(groupSubs.reduce((acc, s) => acc + s.priorityScore, 0) / groupSubs.length);
      const avgConfidence = Math.round(groupSubs.reduce((acc, s) => acc + s.confidenceScore, 0) / groupSubs.length);
      const totalPopulationImpact = groupSubs.reduce((acc, s) => acc + (s.aiAnalysis?.evidence ? 100 : 250), 0);

      const subIds = groupSubs.map(s => s.id);
      const recId = 'rec_' + Math.random().toString(36).substr(2, 9);

      if (isGeminiActive && genAI) {
        try {
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
          });

          const prompt = `
            You are a senior government solutions architect. Propose a single development project recommendation to address a cluster of citizen complaints.
            Based on:
            - Complaint Category: ${category}
            - Location: ${region}, ${constituency}
            - Citizen Grievance Count: ${groupSubs.length}
            - Public Gaps in region: ${JSON.stringify(publicData.gaps)}
            - Policy Documents Citations: ${JSON.stringify(citationTitles)}
            
            Output a JSON object matching this TypeScript structure:
            {
              "title": "Clear project title (e.g. Village Drinking Water Pipe Expansion)",
              "description": "Comprehensive scope of works proposing key fixes.",
              "estimatedBudget": 1500000 (Number in Rupees),
              "estimatedTimeline": "3-6 months",
              "riskAnalysis": "Mention 1-2 project execution risks (e.g., monsoon delays, land permissions)",
              "benefits": "Core benefits (e.g., safe drinking water, reduced walking time for water)",
              "expectedComplaintReduction": 85 (Percentage, number 0-100),
              "sdgMapping": ["SDG X: Description"],
              "reasoning": "Explain why this project is selected and how it resolves the complaints."
            }
          `;

          const response = await model.generateContent(prompt);
          const aiJson = JSON.parse(response.response.text());

          const recommendation: Recommendation = {
            id: recId,
            title: aiJson.title,
            description: aiJson.description,
            category,
            constituency,
            linkedSubmissions: subIds,
            priorityScore: avgPriority,
            confidenceScore: avgConfidence,
            populationImpact: totalPopulationImpact,
            infrastructureGapIndex: category === 'Water Supply' ? 8 : category === 'Roads & Transport' ? 7 : 5,
            estimatedBudget: aiJson.estimatedBudget,
            estimatedTimeline: aiJson.estimatedTimeline,
            governmentSchemes: sampleSub.aiAnalysis.suggestedSchemes,
            riskAnalysis: aiJson.riskAnalysis,
            benefits: aiJson.benefits,
            expectedComplaintReduction: aiJson.expectedComplaintReduction,
            sdgMapping: aiJson.sdgMapping || ['SDG 11: Sustainable Cities'],
            reasoning: aiJson.reasoning,
            retrievedDocuments: citationTitles,
            status: 'proposed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await db.addDoc('recommendations', recId, recommendation);
          generatedRecs.push(recommendation);
          continue;
        } catch (err) {
          console.error('Failed to generate recommendation via Gemini, falling back to rules:', err);
        }
      }

      // Offline rule fallback generator
      let projectTitle = `Integrated ${category} Development in ${region}`;
      let projectDesc = `Reconstruction and improvement of public ${category} networks in ${region} to address ${groupSubs.length} citizen submissions.`;
      let budget = 850000;
      let timeline = '2-4 months';
      let risks = 'Monsoon weather patterns, site land permissions.';
      let benefits = `Improves local lifestyle safety and access to critical public service infrastructures.`;
      let sdg = ['SDG 11: Sustainable Cities and Communities'];

      if (category === 'Roads & Transport') {
        projectTitle = `${region} Rural Feeder Road Rehabilitation`;
        projectDesc = `Widening and blacktopping of local access tracks in ${region} to enable all-weather vehicle transit, connecting farms to markets.`;
        budget = 3500000;
        timeline = '4-6 months';
        risks = 'Land acquisition delays, asphalt material sourcing bottlenecks.';
        benefits = 'Enables secure emergency health access and lowers agricultural transit costs.';
        sdg = ['SDG 9: Industry, Innovation, and Infrastructure', 'SDG 11: Sustainable Cities'];
      } else if (category === 'Water Supply') {
        projectTitle = `${region} Overhead Reservoir and Water Pipeline Distribution`;
        projectDesc = `Installation of a 50,000 Litre community reservoir tank, filter beds, and connection pipes supplying domestic taps.`;
        budget = 1800000;
        timeline = '3-5 months';
        risks = 'Groundwater table drop, seasonal drilling restrictions.';
        benefits = 'Ensures clean drinking water availability, eradicating water-borne bacterial infections.';
        sdg = ['SDG 6: Clean Water and Sanitation', 'SDG 3: Good Health and Well-being'];
      }

      const recommendation: Recommendation = {
        id: recId,
        title: projectTitle,
        description: projectDesc,
        category,
        constituency,
        linkedSubmissions: subIds,
        priorityScore: avgPriority,
        confidenceScore: avgConfidence,
        populationImpact: totalPopulationImpact,
        infrastructureGapIndex: category === 'Water Supply' ? 8 : category === 'Roads & Transport' ? 7 : 5,
        estimatedBudget: budget,
        estimatedTimeline: timeline,
        governmentSchemes: sampleSub.aiAnalysis.suggestedSchemes,
        riskAnalysis: risks,
        benefits: benefits,
        expectedComplaintReduction: 90,
        sdgMapping: sdg,
        reasoning: `Recommended due to high priority score (${avgPriority}) clustered across ${groupSubs.length} submissions. Retrospectively matches infrastructure gaps identified in local Census maps.`,
        retrievedDocuments: citationTitles,
        status: 'proposed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addDoc('recommendations', recId, recommendation);
      generatedRecs.push(recommendation);
    }

    return generatedRecs;
  } catch (error) {
    console.error('Error in Recommendation Engine:', error);
    return [];
  }
};
