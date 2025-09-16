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
  try {
    if (jiraId) {
      const issue = await getIssue(jiraId);
      const issueStatus = issue?.fields?.status?.name;
      console.log("JIRA Issue Status:", issueStatus);
      if (["To Do", "Open", "Unrefined"].includes(issueStatus)) {
        await changeJiraStatus(jiraId, "In Progress");
        console.log(`JIRA Issue ${jiraId} status changed to "In Progress".`);
      } else {
        console.log(`JIRA Issue ${jiraId} is not in a status that can be changed.`);
      }
      const jiraUrl = `https://hclsw-jirads.atlassian.net/browse/${jiraId}`;
      const jiraLink = `[${jiraId}](${jiraUrl})`;
      return `### 🎟️ Jira Ticket\n${jiraLink}`;
    } else {
      throw new Error("No JIRA ID found in PR title.");
    }
  } catch (error) {
    console.error("Error composing Jira section:", error);
    return "";
  }
}

export async function composeAISummary(prData: object): Promise<string> {
  try {
    const aiSummary = await askAI(JSON.stringify(prData), PR_DESCRIPTION_PROMPT);
    
    if (aiSummary) {
      console.log("AI Summary generated:", aiSummary);
      return `### 🤖 AI Summary\n${aiSummary}`;
    } else {
      throw new Error("AI returned an empty summary.");
    }
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return `### 🤖 AI Summary\nError generating AI summary.`;
  }
}