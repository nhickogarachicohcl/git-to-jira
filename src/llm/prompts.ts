// export const SYSTEM_PROMPT = `
// You are a senior engineer. Generate a summary from the following diff. Format the response as Jira's Legacy Renderer with these sections:
// * Summary: A high-level overview of the changes.
// * Files Changed: A one-sentence summary for each modified file.
// * Testing: Details on how the changes were verified.
// * Related Issues: (Optional) List any related issue numbers (e.g., "Closes #123").

//     Diff:
// `;

export const SYSTEM_PROMPT = `
I need you to write a Jira comment summarizing code changes based on the provided git diff output or a list of commit messages.

The summary must be formatted using Jira's Legacy Renderer.

Please generate a clear, concise summary of the changes that includes:

A High-level overview: A brief statement of what the changes accomplish.

Key changes: A bulleted list of the main files or components that were modified.

Purpose: The reason for the changes (e.g., bug fix, new feature, refactoring).

Impacts: Any potential side effects or areas to watch out for.

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
