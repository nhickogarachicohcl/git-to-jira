import { execSync } from 'child_process';
import {
  getCommitDetails,
  getCurrentBranchName,
  type BasicCommit,
  type DetailedCommit,
} from './commits.js';

export interface LLMOutput {
  jiraKey: string | null;
  branchName: string;
  summary: {
    totalCommits: number;
    totalFilesChanged: number;
    commits: DetailedCommit[];
  };
}

// Extract Jira key from branch name
export function extractJiraKey(branchName: string): string | null {
  const jiraMatch = branchName.match(/([A-Z]+-\d+)/);
  return jiraMatch?.[1] || null;
}

// Format final JSON output
export function formatForLLM(
  jiraKey: string | null,
  branchName: string,
  flaggedCommits: BasicCommit[]
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
    summary: {
      totalCommits: totalCommits,
      totalFilesChanged: totalFilesChanged,
      commits: commitDetails,
    },
  };
}
