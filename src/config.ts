import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const JIRA_API_KEY = process.env.JIRA_API_KEY || '';
