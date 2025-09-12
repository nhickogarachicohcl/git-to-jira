export const SYSTEM_PROMPT = `
You are a senior engineer. Generate a summary from the following diff. Format the response as Jira's Legacy Renderer with these sections:
* Summary: A high-level overview of the changes.
* Files Changed: A one-sentence summary for each modified file.
* Testing: Details on how the changes were verified.
* Related Issues: (Optional) List any related issue numbers (e.g., "Closes #123").
    
    Diff:
`;

export const getFooterDisclaimer = () => {
  return '\n\n_Disclaimer: This comment is AI generated_';
};
