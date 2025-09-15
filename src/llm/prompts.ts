export const SYSTEM_PROMPT = `
Please write a short and concise Jira comment summarizing code changes based on the provided git diff or a list of commit messages. The summary must use Jira's Legacy Renderer.

Use the following conventions:

Headings: h2.  for section titles.

Bold text: *text*.

Bulleted lists: * at the beginning of each line.

Monospace/Inline Code: {{text}} for filenames or code snippets.

Links: If a remote URL and branch are provided, create a link to the GitHub branch using the format [View on GitHub|{{remote_url}}/tree/{{branch}}].
`;

export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
