import { extractJiraKey, formatForLLM } from '../../src/git/jiraParser.js';
import {
  findFlaggedCommits,
  getCommitsFromPush,
  getCurrentBranchName,
} from '../../src/git/commits.js';
import { summarize } from '../../src/llm/index.js';
// Get GitHub context
const ref: string = process.env.GITHUB_REF || '';
const eventName: string = process.env.GITHUB_EVENT_NAME || '';

console.log('=== GitHub Actions Context ===');
console.log('Ref:', ref);
console.log('Event:', eventName);
console.log('Test1:', eventName);

// Main execution
const branchName = getCurrentBranchName(ref);
const jiraKey = extractJiraKey(branchName);
const allCommits = getCommitsFromPush();
const flaggedCommits = findFlaggedCommits(allCommits);

console.log('\n=== Results ===');
console.log('Jira Key:', jiraKey);
console.log('Total commits:', allCommits.length);
console.log('Flagged commits:', flaggedCommits.length);

if (flaggedCommits.length > 0) {
  console.log('\n=== Processing Commits ===');
  flaggedCommits.forEach((commit, index) => {
    console.log(
      `${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
    );
  });

  // Generate final JSON output
  const llmData = formatForLLM(jiraKey, branchName, flaggedCommits);

  console.log('\n=== LLM DATA OUTPUT ===');
  console.log(JSON.stringify(llmData, null, 2));
  console.log('=== END LLM DATA ===');

  const {
    summary: { commits },
  } = llmData;
  console.log('Summarizing using LLM');
  const summary = await summarize(JSON.stringify(commits));
  console.log(`Summary:\n${summary}`);
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}
