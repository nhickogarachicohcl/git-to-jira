export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff or a list of commit messages.
-Use "*Code Changes Summary*" as the header/title.
-Make the summary short and concise.
-Separate summary per commit.
-The summary must use Jira's Legacy Renderer.
`;

export const getFooterDisclaimer = (remoteUrl: string, hasUpstream = false) => {
  return `\n\n${hasUpstream ? 'Branch' : 'Remote'} Link: ${remoteUrl} ${!hasUpstream ? '(not pushed to repo yet)' : ''}\n_Disclaimer: This comment is AI generated_`;
};
