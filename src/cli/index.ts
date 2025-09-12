import {
  findFlaggedCommits,
  getCommitsFromGit,
  getCurrentBranchName,
} from '../git/commits.js';
import { extractJiraKey, formatForLLM } from '../git/jiraParser.js';

const branchName = getCurrentBranchName();
const jiraKey = extractJiraKey(branchName);
const allCommits = getCommitsFromGit();
const flaggedCommits = findFlaggedCommits(allCommits);

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
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}
