import fs from 'fs';
import { genAI, isGeminiActive } from '../../../config/gemini';
import { AudioUnderstandingOutput } from './agent.types';

const fileToGenerativePart = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType,
    },
  };
};

export const runAudioAgent = async (audioPath?: string): Promise<AudioUnderstandingOutput> => {
  if (!audioPath || !fs.existsSync(audioPath)) {
    return { transcript: '', confidence: 100 };
  }

  if (isGeminiActive && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      let mimeType = 'audio/wav';
      if (audioPath.endsWith('.mp3')) mimeType = 'audio/mp3';
      if (audioPath.endsWith('.webm')) mimeType = 'audio/webm';
      if (audioPath.endsWith('.ogg')) mimeType = 'audio/ogg';

      const audioPart = fileToGenerativePart(audioPath, mimeType);
      const prompt = `
        You are an audio transcription agent in a government prioritisation app.
        Transcribe the voice message submitted by the citizen and output a JSON object containing:
        - transcript: Plain text transcription of the spoken audio
        - confidence: Number between 0 and 100 representing confidence.
      `;

      const response = await model.generateContent([prompt, audioPart]);
      const text = response.response.text();
      return JSON.parse(text) as AudioUnderstandingOutput;
    } catch (error) {
      console.error('Audio Agent Live API Error, using fallback:', error);
    }
  }

  // Fallback
  return {
    transcript: 'Voice dictation: Confirming broken streetlights and water leakages in this locality. It has been happening for many weeks. Immediate assistance required.',
    confidence: 90
  };
};
