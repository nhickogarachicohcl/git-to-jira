import {
  findFlaggedCommits,
  getCommitsFromGit,
  getCurrentBranchName,
} from '../git/commits.js';
import { extractJiraKey, formatForLLM } from '../git/jiraParser.js';
import { summarizeFile } from '../index.js';
import { addComment, getIssue } from '../jira/issues.js';

const branchName = getCurrentBranchName();
const jiraKey = extractJiraKey(branchName);
const allCommits = getCommitsFromGit();
const flaggedCommits = findFlaggedCommits(allCommits);

let llmData;
if (flaggedCommits.length > 0) {
  console.log('\n=== Processing Commits ===');
  flaggedCommits.forEach((commit, index) => {
    console.log(
      `${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
    );
  });

  // Generate final JSON output
  llmData = formatForLLM(jiraKey, branchName, flaggedCommits);

  // LLM
  if (llmData && llmData.jiraKey) {
    console.log('\n=== Initializing LLM Summarizer ===');
    // get Jira issue first
    const { jiraKey } = llmData;
    try {
      console.log('Fetching Jira issue');
      const jiraIssue = await getIssue(jiraKey);

      if (jiraIssue && jiraIssue.id) {
        console.log(`Found Jira issue ${jiraKey}`);
        // Summarize changes
        const {
          summary: { commits },
        } = llmData;
        console.log('Summarizing using LLM');
        const summary = await summarizeFile(JSON.stringify(commits));

        if (summary) {
          console.log(`Summarized changes\n${summary}`);
          console.log(`Adding comment in Jira issue ${jiraKey}`);
          // Comment
          await addComment(jiraKey, summary);
          console.log('Successfully added comment!');
        }
      }
    } catch (error) {
      console.error('Error summarizing changes');
    }
  }
  console.log(JSON.stringify(llmData, null, 2));
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}
