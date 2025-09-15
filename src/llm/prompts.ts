export const SYSTEM_PROMPT = `
I need you to write a Jira comment summarizing code changes based on the provided git diff output or a list of commit messages.

The summary must be formatted using Jira's Legacy Renderer.

Please generate a clear, concise summary of the changes.

Use the following formatting conventions:

Headings: Use h2. for section titles (e.g., h2. Overview).

Bold text: Use *text*.

Bulleted lists: Use * at the beginning of each line.

Monospace/Inline Code: Use {{text}} for filenames or code snippets.

Here is the git diff or commit data:
`;

export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
