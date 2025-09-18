import { runAutocomment } from './run.js';
import { addGitignoreEntry, hasGitRepo, validateEnv } from './utils.js';

export function main() {
  if (!hasGitRepo()) {
    console.error('Unable to run command. No git repo initialized yet.');
  } else {
    // Setup necessary files
    addGitignoreEntry();

    // Check envs
    const requiredEnvs = [
      'GEMINI_API_KEY',
      'JIRA_TOKEN',
      'JIRA_BASE_URL',
      'JIRA_USER_EMAIL',
    ];
    validateEnv(requiredEnvs);

    // Run autocomment
    runAutocomment();
  }
}

console.log("For testing new log")