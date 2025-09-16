import {
  findFlaggedCommits,
  getCommitsFromGit,
  getCurrentBranchName,
  getCurrentRemoteUrl,
  hasUpstreamBranch,
} from './git/commits.js';
import { extractJiraKey, formatForLLM } from './git/jiraParser.js';
import { addJiraComment, getJiraIssue } from './jira/index.js';
import { summarize } from './llm/index.js';
import { getFooterDisclaimer } from './llm/prompts.js';
import { addCommit, getProcessedCommits, isCommitProcessed } from './utils.js';

export async function runAutocomment() {
  const branchName = getCurrentBranchName();
  const jiraKey = extractJiraKey(branchName) ?? '';
  const remoteUrl = getCurrentRemoteUrl();
  const allCommits = getCommitsFromGit();
  const unfilteredFlaggedCommits = findFlaggedCommits(allCommits);
  // Filter already commented commits
  const processedCommits = getProcessedCommits();
  const flaggedCommits = unfilteredFlaggedCommits.filter((commit) => {
    return !isCommitProcessed(jiraKey, commit.sha, processedCommits);
  });

  const hasUpstream = hasUpstreamBranch();

  let llmData;
  if (flaggedCommits.length > 0) {
    console.log('\n=== Processing Commits ===');
    flaggedCommits.forEach((commit, index) => {
      console.log(
        `${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
      );
    });

    // Generate final JSON output
    llmData = formatForLLM(
      jiraKey,
      branchName,
      flaggedCommits,
      remoteUrl,
      hasUpstream
    );

    // LLM
    if (llmData && llmData.jiraKey) {
      console.log('\n=== Initializing LLM Summarizer ===');
      // get Jira issue first
      const { jiraKey } = llmData;
      try {
        console.log('Fetching Jira issue');
        const jiraIssue = await getJiraIssue(jiraKey);

        if (jiraIssue && jiraIssue.id) {
          console.log(`Found Jira issue ${jiraKey}`);
          // Summarize changes
          const {
            summary: { commits },
          } = llmData;
          console.log('Summarizing using LLM');
          let summary = await summarize(JSON.stringify(commits));
          if (summary) {
            summary += getFooterDisclaimer(
              llmData.remoteUrl ?? remoteUrl,
              hasUpstream
            );
            console.log(`Summarized changes\n${summary}`);
            console.log(`Adding comment in Jira issue ${jiraKey}`);
            // Comment
            await addJiraComment(jiraKey, summary);
            // Save processed commits to json

            flaggedCommits.forEach((commit) =>
              addCommit(jiraKey, commit.sha, processedCommits)
            );
            console.log('Successfully added comment!');
          }
        }
      } catch (error) {
        console.error('Error summarizing changes', error);
      }
    }
  } else {
    console.log('No flagged commits found. Skipping LLM processing.');
  }
}
