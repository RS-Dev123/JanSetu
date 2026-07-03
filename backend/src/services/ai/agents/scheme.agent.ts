import { genAI, isGeminiActive } from '../../../config/gemini';
import { SchemeSDGOutput } from './agent.types';

export const runSchemeAgent = async (translatedText: string, category: string): Promise<SchemeSDGOutput> => {
  if (isGeminiActive && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `
        You are a government program advisor. Match the citizen grievance to relevant central government schemes in India (e.g. Jal Jeevan Mission, PMGSY, Swachh Bharat Abhiyan, PM-AWAS, Smart Cities Mission, Ayushman Bharat, Samagra Shiksha) and map it to UN Sustainable Development Goals (SDGs).
        Output a JSON object matching this structure:
        {
          "suggestedSchemes": ["Scheme 1", "Scheme 2"],
          "sdgMapping": ["SDG X: Description", "SDG Y: Description"],
          "confidence": 90
        }

        Category: ${category}
        Grievance text:
        """
        ${translatedText}
        """
      `;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as SchemeSDGOutput;
    } catch (error) {
      console.error('Scheme Agent Live API Error, using fallback:', error);
    }
  }

  // Local Rule-based Mapper Fallback
  const suggestedSchemes: string[] = [];
  const sdgMapping: string[] = [];

  switch (category) {
    case 'Roads & Transport':
      suggestedSchemes.push('PMGSY (Pradhan Mantri Gram Sadak Yojana)', 'Central Road Fund');
      sdgMapping.push('SDG 9: Industry, Innovation, and Infrastructure', 'SDG 11: Sustainable Cities and Communities');
      break;
    case 'Water Supply':
      suggestedSchemes.push('Jal Jeevan Mission (Rural)', 'AMRUT (Urban Water Supply)');
      sdgMapping.push('SDG 6: Clean Water and Sanitation', 'SDG 11: Sustainable Cities and Communities');
      break;
    case 'Electricity & Power':
      suggestedSchemes.push('Deen Dayal Upadhyaya Gram Jyoti Yojana (DDUGJY)', 'Saubhagya Scheme');
      sdgMapping.push('SDG 7: Affordable and Clean Energy', 'SDG 9: Industry, Innovation, and Infrastructure');
      break;
    case 'Sanitation & Waste':
      suggestedSchemes.push('Swachh Bharat Mission (Gramin/Urban)', 'NAMAMI GANGE Project');
      sdgMapping.push('SDG 6: Clean Water and Sanitation', 'SDG 12: Responsible Consumption and Production');
      break;
    case 'Healthcare':
      suggestedSchemes.push('Ayushman Bharat PM-JAY', 'National Health Mission (NHM)');
      sdgMapping.push('SDG 3: Good Health and Well-being');
      break;
    case 'Education':
      suggestedSchemes.push('Samagra Shiksha Abhiyan', 'PM SHRI Schools');
      sdgMapping.push('SDG 4: Quality Education');
      break;
    case 'Public Spaces':
      suggestedSchemes.push('Smart Cities Mission', 'HRIDAY (Heritage City Development)');
      sdgMapping.push('SDG 11: Sustainable Cities and Communities');
      break;
    default:
      suggestedSchemes.push('MPLADS (Local Area Development Scheme)', 'District Innovation Fund');
      sdgMapping.push('SDG 11: Sustainable Cities and Communities');
  }

  return {
    suggestedSchemes,
    sdgMapping,
    confidence: 90
  };
};
