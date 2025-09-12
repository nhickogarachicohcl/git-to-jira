import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function summarizeFile(filePath: string): Promise<void> {
  try {

    const fileContent = await fs.readFile(filePath, 'utf-8');

    const prompt = `Please provide a concise summary of the following text:\n\n${fileContent}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log(response.text);
  } catch (error) {
    console.error('Error reading file or generating summary:', error);
  }
}

summarizeFile("./input.txt");