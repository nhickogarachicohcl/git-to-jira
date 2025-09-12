// Extract Jira key from branch name
export function extractJiraKey(branchRef: string): string | null {
  const branchName = branchRef.replace('refs/heads/', '');
  const jiraMatch = branchName.match(/([A-Z]+-\d+)/);
  return jiraMatch?.[1] || null;
}
