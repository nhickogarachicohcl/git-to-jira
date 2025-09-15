export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff or a list of commit messages. The summary must use Jira's Legacy Renderer.
`;

export const getFooterDisclaimer = (remoteUrl: string) => {
  return `\n\nBranch Link: ${remoteUrl}\n_Disclaimer: This comment is AI generated_`;
};
