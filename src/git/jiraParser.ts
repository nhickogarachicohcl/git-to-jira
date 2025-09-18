import { CONFIG } from '../config.js';
import {
  getCommitDetails,
  type BasicCommit,
  type DetailedCommit,
} from './commits.js';

export interface LLMOutput {
  jiraKey: string | null;
  branchName: string;
  remoteUrl?: string;
  summary: {
    totalCommits: number;
    totalFilesChanged: number;
    commits: DetailedCommit[];
  };
}

// Extract Jira key from branch name
export function extractJiraKey(
  branchName: string,
  regexString: string
): string | null {
  console.log('Extracting Jira key');
  try {
    const regex = new RegExp(regexString);
    const jiraMatch = branchName.match(regex);
    const jiraKey = jiraMatch?.[1] || null;

    if (!jiraKey) {
      console.error(
        'Unable to extract Jira key. Provide a valid branch name or regex'
      );
      return null;
    }
    console.log(`Extracted Jira key: ${jiraKey}`);
    return jiraKey;
  } catch {
    console.error(
      'Unable to extract Jira key. Provide a valid branch name or regex'
    );
    return null;
  }
}

// Format final JSON output
export function formatForLLM(
  jiraKey: string | null,
  branchName: string,
  flaggedCommits: BasicCommit[],
  remoteUrl?: string,
  hasUpstream = false
): LLMOutput {
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
    branchName,
    ...(remoteUrl &&
      hasUpstream && {
        remoteUrl: `${remoteUrl}/tree/${branchName}`,
      }),
    summary: {
      totalCommits: totalCommits,
      totalFilesChanged: totalFilesChanged,
      commits: commitDetails,
    },
  };
}
