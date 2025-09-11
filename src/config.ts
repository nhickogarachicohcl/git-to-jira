import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

interface Git2JiraConfig {
  commitMessageFlag?: string;
  llm?: {
    systemPrompt?: string;
    maxTokens?: number;
  };
  jira?: {
    ticketPrefixes?: string[];
    fieldsToInclude?: string[];
  };
}

const DEFAULT_CONFIG_FILENAME = 'git2jira.config.json';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
export const JIRA_TOKEN = process.env.JIRA_TOKEN || '';
export const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL || '';

const getConfig = (
  fileName = DEFAULT_CONFIG_FILENAME
): Git2JiraConfig | object => {
  // Check if git2jira.config.json file exists in the current directory
  const configPath = path.join(process.cwd(), fileName);

  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      console.error('Invalid JSON:', err);
      return {};
    }
  } else {
    console.error(`${fileName} does not exist in the root directory.`);
    return {};
  }
};

export const CONFIG: Git2JiraConfig = getConfig();
