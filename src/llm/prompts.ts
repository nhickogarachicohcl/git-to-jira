// export const SYSTEM_PROMPT = `
// You are a senior engineer. Generate a summary from the following diff. Format the response as Jira's Legacy Renderer with these sections:
// * Summary: A high-level overview of the changes.
// * Files Changed: A one-sentence summary for each modified file.
// * Testing: Details on how the changes were verified.
// * Related Issues: (Optional) List any related issue numbers (e.g., "Closes #123").

//     Diff:
// `;

export const SYSTEM_PROMPT = `
Write a Jira comment summarizing the code changes for a pull request. The summary should be concise, clear, and easy for both developers and project managers to understand.

Here's a good example prompt you can adapt:

"I am writing a Jira comment to summarize the code changes for a pull request. The user has provided the output of a git diff or a list of commits.

Please analyze the provided git diff output and/or commit messages and generate a concise summary of the changes. The summary should include:

A high-level overview: A brief statement of what the pull request accomplishes.

Key changes: A bulleted list of the main files or components that were modified.

Purpose/Why: The reason for the changes (e.g., bug fix, new feature, refactoring).

Potential impacts: Any known side effects or areas to watch out for.

Please format the summary clearly with headings and bullet points for readability and using Jira Legacy Renderer. Be sure to avoid technical jargon where possible, but include enough detail for a developer to understand the scope of the changes.

Here is the git diff/commit data:
`;
export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
