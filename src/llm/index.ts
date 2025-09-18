import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SYSTEM_PROMPT } from './prompts.js';
import { GEMINI_API_KEY } from '../config.js';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function summarize(input: string): Promise<string | undefined> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: input,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Error generating summary:', error);
    return undefined;
  }
}
