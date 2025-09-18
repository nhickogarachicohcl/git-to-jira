export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff and commit messages.
-Use "Code Changes Summary" as the heading1.
-Only summarize the main points.
-List major changes in bullet points to make it readable
-The summary must use Jira's Legacy Renderer.

Example:
Code Changes Summary
- Major change 1
- Major change 2

Notes: (if there are any notes to include)
`;

export const getFooterDisclaimer = (remoteUrl: string, hasUpstream = false) => {
  return `\n\n${hasUpstream ? 'Branch' : 'Remote'} Link: ${remoteUrl} ${!hasUpstream ? '(not pushed to repo yet)' : ''}\n_Disclaimer: This comment is AI generated_`;
};
