import { extractJiraKey } from '../../src/git/jiraParser.js';
import {
  BasicCommit,
  DetailedCommit,
  findFlaggedCommits,
  getCommitDetails,
  getCommitsFromPush,
} from '../../src/git/commits.js';
interface LLMOutput {
  jiraKey: string | null;
  branchName: string;
  summary: {
    totalCommits: number;
    totalFilesChanged: number;
    commits: DetailedCommit[];
  };
}

// Get GitHub context
const ref: string = process.env.GITHUB_REF || '';
const eventName: string = process.env.GITHUB_EVENT_NAME || '';

console.log('=== GitHub Actions Context ===');
console.log('Ref:', ref);
console.log('Event:', eventName);

// Format final JSON output
function formatForLLM(
  jiraKey: string | null,
  branchRef: string,
  flaggedCommits: BasicCommit[]
): LLMOutput {
  const branchName = branchRef.replace('refs/heads/', '');

  // Get detailed data for each commit
  const commitDetails = flaggedCommits.map(getCommitDetails);

  // Calculate total commits and file changes
  const totalCommits = commitDetails.length;
  const totalFilesChanged = commitDetails.reduce(
    (total, commit) => total + commit.files.length,
    0
  );

  return {
    jiraKey: jiraKey,
    branchName: branchName,
    summary: {
      totalCommits: totalCommits,
      totalFilesChanged: totalFilesChanged,
      commits: commitDetails,
    },
  };
}

// Main execution
const jiraKey = extractJiraKey(ref);
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
  const llmData = formatForLLM(jiraKey, ref, flaggedCommits);

  console.log('\n=== LLM DATA OUTPUT ===');
  console.log(JSON.stringify(llmData, null, 2));
  console.log('=== END LLM DATA ===');
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}
