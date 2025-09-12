import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations
import { llmData } from './git/parse-commits.js';
import { getIssue } from './jira/issues.js';
import { addJiraComment } from './jira/updateJira.js';
import {
  GEMINI_API_KEY,
  JIRA_BASE_URL,
  JIRA_TOKEN,
  JIRA_USER_EMAIL,
} from './config.js';

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
  const { branchName, jiraKey } = llmData;
  console.log('--- Initializing Git to Jira ---');
  console.log(`Running on branch: ${branchName}`);
  console.log(`Will comment on Jira issue: ${jiraKey}`);

  if (jiraKey) {
    try {
      // Get jira issue
      const jiraIssue = await getIssue(jiraKey);
      if (jiraIssue && jiraIssue.id) {
        console.log(`Fetched Jira issue ${jiraKey} with id ${jiraIssue.id}`);
        const commits = llmData.summary.commits;

        if (commits.length > 0) {
          console.log(
            `Fetched commits for branch ${branchName}:\n${JSON.stringify(commits)}`
          );
          // Run summarizer
          console.log('Feeding commits to LLM to summarize...');
          const summary = await summarizeFile(JSON.stringify(commits));
          if (summary) {
            console.log(`Summary generated:\n${summary}`);
            console.log(`Posting to Jira issue ${jiraKey}`);
            await addJiraComment(jiraKey, summary);
            console.log('Successfuly posted summary!');
          } else {
            console.error('Error: No summary generated');
          }
        } else {
          console.warn('No commits found');
        }
      } else {
        console.warn('No Jira issue found');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  } else {
    console.error('No Jira key found');
  }
}
