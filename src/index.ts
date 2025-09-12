import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations
import { llmData } from './git/parse-commits.js';
import { getIssue } from './jira/issues.js';
import { addJiraComment } from './jira/updateJira.js';

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function summarizeFile(input: string, filePath?: string): Promise<any> {
  try {
    // const fileContent = await fs.readFile(filePath, 'utf-8');

    // const prompt = `Please provide a concise summary of the following text:\n\n${fileContent}`;
    const prompt = `Please provide a concise summary of the following git diffs:\n\n${input}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error reading file or generating summary:', error);
    return undefined;
  }
}

if (llmData) {
  const jiraKey = llmData.jiraKey;
  if (jiraKey) {
    try {
      // Get jira issue
      const jiraIssue = await getIssue(jiraKey);
      if (jiraIssue && jiraIssue.id) {
        const commits = llmData.summary.commits;

        if (commits.length > 0) {
          // Run summarizer
          const summary = await summarizeFile(JSON.stringify(commits));
          if (summary) {
            await addJiraComment(jiraKey, summary);
          }
        }
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  }
}
