import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
export const JIRA_TOKEN = process.env.JIRA_TOKEN || '';
export const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL || '';
