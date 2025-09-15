export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff or a list of commit messages. The summary must use Jira's Legacy Renderer. Use {{text}} for filenames or code snippets, * for bullet points, and text for bold text.

Here is the git diff or commit data:
`;

export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
