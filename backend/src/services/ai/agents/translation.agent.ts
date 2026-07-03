import { genAI, isGeminiActive } from '../../../config/gemini';
import { TranslationOutput } from './agent.types';

const MOCK_TRANSLATION_MAP: Record<string, { lang: string; trans: string }> = {
  'पानी की समस्या': { lang: 'Hindi', trans: 'Water supply issue. We have not had water for 3 days.' },
  'पानी नहीं आ रहा': { lang: 'Hindi', trans: 'Water is not coming in our village.' },
  'सड़क टूटी हुई है': { lang: 'Hindi', trans: 'The road is broken and full of potholes. Accidents are happening.' },
  'बिजली नहीं है': { lang: 'Hindi', trans: 'Power outage. Electricity is gone for 12 hours daily.' },
  'রাস্তা খারাপ': { lang: 'Bengali', trans: 'The road conditions are extremely bad. School kids are falling down.' },
  'জল পাওয়া যাচ্ছে না': { lang: 'Bengali', trans: 'Drinking water is not available. Local handpumps are broken.' },
  'தண்ணீர் பிரச்சினை': { lang: 'Tamil', trans: 'Water issues. We need pipelines immediately.' },
  'சாலை பழுது': { lang: 'Tamil', trans: 'Road damage. Vehicles are getting stuck in mud.' }
};

export const runTranslationAgent = async (title: string, description: string): Promise<TranslationOutput> => {
  const combinedText = `${title}\n${description}`;

  if (isGeminiActive && genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const prompt = `
        You are a translation agent in a government prioritisation app.
        Analyze this text and output a JSON object containing:
        - detectedLanguage: Name of language (e.g., Hindi, Bengali, Tamil, English)
        - englishTranslation: Complete translation of the input text into fluent English
        - confidence: Number between 0 and 100 representing detection confidence.

        Input Text:
        """
        ${combinedText}
        """
      `;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as TranslationOutput;
    } catch (error) {
      console.error('Translation Agent Live API Error, using fallback:', error);
    }
  }

  // Local Fallback Heuristics
  let detectedLanguage = 'English';
  let englishTranslation = combinedText;
  let confidence = 95;

  for (const [key, value] of Object.entries(MOCK_TRANSLATION_MAP)) {
    if (combinedText.includes(key)) {
      detectedLanguage = value.lang;
      englishTranslation = `${title} - Translated from ${detectedLanguage}: ${value.trans}`;
      confidence = 90;
      break;
    }
  }

  return { detectedLanguage, englishTranslation, confidence };
};
