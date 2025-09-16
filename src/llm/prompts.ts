export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff or a list of commit messages. The summary must use Jira's Legacy Renderer.

Use the following conventions:

Headings: h2.  for section titles.

Bold text: *text*.

Bulleted lists: * at the beginning of each line.

Monospace/Inline Code: {{text}} for filenames or code snippets.

Links: If a remote URL and branch are provided, create a link to the GitHub branch using the format [View on GitHub|{{remote_url}}/tree/{{branch}}].
`;

export const PR_DESCRIPTION_PROMPT = `
You are an AI assistant helping a developer write a pull request description. 
Your goal is to create a clear and concise summary for the reviewer. 
It should contain the following:
1. The problem being solved.
2. The core technical changes implemented.
3. The expected impact on the system.

The format should be compatible with Github's pull request description.`;

export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
