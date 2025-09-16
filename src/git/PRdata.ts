import { Octokit } from "@octokit/rest";
import { getIssue } from "../jira/issues.js";
import { changeJiraStatus } from "../jira/updateJira.js";
import { askAI } from '../llm/index.js';
import { PR_DESCRIPTION_PROMPT } from '../llm/prompts.js';

export async function getPRGitData(owner: string, repo: string, pull_number: number, token: string) {
  const octokit = new Octokit({ auth: token });

  // Get commits in the PR
  const commits = await octokit.pulls.listCommits({ owner, repo, pull_number });
  // Get files changed in the PR
  const files = await octokit.pulls.listFiles({ owner, repo, pull_number });

  // Format data for AI
  return {
    commits: commits.data.map(c => ({
      sha: c.sha,
      author: c.commit.author?.name,
      message: c.commit.message,
      date: c.commit.author?.date,
    })),
    files: files.data.map(f => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch, // optional: can be large
    })),
  };
}

export async function updatePrDescription(owner: string, repo: string, pull_number: number, newDescription: string, token: string) {
  const octokit = new Octokit({ auth: token });
  await octokit.pulls.update({
    owner,
    repo,
    pull_number,
    body: newDescription,
  });
}

export async function composeJiraSection(jiraId: string): Promise<string> {
  if (jiraId) {
    const issue = await getIssue(jiraId);
    const issueStatus = issue.fields.status.name;
    console.log("JIRA Issue Status:", issueStatus);
    if (["To Do", "Open", "Unrefined"].includes(issueStatus)) {
      await changeJiraStatus(jiraId, "In Progress");
      console.log(`JIRA Issue ${jiraId} status changed to "In Progress".`);
    }else{
      console.log(`JIRA Issue ${jiraId} is not in a status that can be changed.`);
    }
    const jiraUrl = `https://hclsw-jirads.atlassian.net/browse/${jiraId}`;
    const jiraLink = `[${jiraId}](${jiraUrl})`;
    return `### 🎟️ Jira Ticket\n${jiraLink}`;
  }else{
    return "";
    console.log("No JIRA ID found in PR title.");
  }
}

export async function composeAISummary(prData: object): Promise<string> {
  const aiSummary = await askAI(JSON.stringify(prData), PR_DESCRIPTION_PROMPT);
  if (aiSummary) {
    // Format summary for PR description (Markdown + Atlassian/Jira markup)
    let formattedSummary = aiSummary
      .replace(/^h2\.\s*/gm, '## ') // Convert h2. to Markdown
      .replace(/^New Features:/gm, '**New Features:**')
      .replace(/^Key Changes & Additions:/gm, '**Key Changes & Additions:**')
      .replace(/\{\{(.+?)\}\}/g, '`$1`') // Convert {{file}} to inline code
      .replace(/\{\{(.+?)#(.+?)\}\}/g, '`$1#$2`'); // Convert {{file#symbol}} to inline code
    return `### 🤖 AI Summary\n${formattedSummary}`;
  } else {
    return `### 🤖 AI Summary\nNo AI summary generated.`;
    console.log("No AI summary generated.");
  }
}