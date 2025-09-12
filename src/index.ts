import { CONFIG } from './config.js';
import { getIssue } from './jira/issues.js';

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function summarizeFile(filePath: string): Promise<void> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const prompt = `Generate a pull request summary from the following diff. Format the response in markdown with these sections:
    * **Summary**: A high-level overview of the changes.
    * **Files Changed**: A one-sentence summary for each modified file.
    * **Testing**: Details on how the changes were verified.
    * **Related Issues**: (Optional) List any related issue numbers (e.g., "Closes #123").
        Diff: ${fileContent}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log(response.text);
  } catch (error) {
    console.error('Error reading file or generating summary:', error);
  }
}

// summarizeFile('./input.txt');

console.log('---CONFIG VARIABLES---');
console.log(CONFIG);

// Get sample jira issue based on config
// console.log('---SAMPLE JIRA ISSUE---');

// const sampleIssue = await getIssue(
//   `${CONFIG.jira?.ticketPrefix ?? 'DXQ'}-4567`
// );

// console.log(sampleIssue);
