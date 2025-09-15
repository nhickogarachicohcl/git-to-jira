import { Octokit } from "@octokit/rest";
import fs from "fs";
import { extractJiraKey, formatForLLM } from "../../src/git/jiraParser";
import { getPRGitData } from "../../src/git/PRdata";
import { getIssue } from "../../src/jira/issues";
import {
  findFlaggedCommits,
  getCommitsFromGit,
  getCurrentBranchName,
  getCurrentRemoteUrl,
} from '../../src/git/commits';
import { askAI } from '../../src/llm/index';
import { PR_DESCRIPTION_PROMPT } from '../../src/llm/prompts';

//Load event payload
const eventPath = process.env.GITHUB_EVENT_PATH!;
const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

const token = process.env.GITHUB_TOKEN!;
const octokit = new Octokit({ auth: token });

async function updatePrDescription(owner: string, repo: string, pull_number: number, newDescription: string) {
  await octokit.pulls.update({
    owner,
    repo,
    pull_number,
    body: newDescription,
  });
}


const owner = event.repository.owner.login;
const repo = event.repository.name;
const pull_request = event.pull_request;
const newDescription = "This PR description was set dynamically by enhance-pr-details.ts";

console.log("Updating PR description...");
console.log("owner:", owner);
console.log("repo:", repo);
console.log("pull_request.number:", pull_request.number);
console.log("newDescription:", newDescription);


getPRGitData(owner, repo, pull_request.number, token).then(async (data) => {
    console.log("PR Git Data:", data);
    return data;
}).catch(console.error);






let jiraSection = '';
//Update Jira issue status to "In Progress" if it's currently "To Do" or "Open"
const prTitle = pull_request.title || pull_request.base?.title || pull_request.head?.title;
console.log("PR Title:", prTitle);
// --- 1. Extract Jira Ticket and Create Link ---
const jiraId = extractJiraKey(prTitle || "");
console.log("Extracted JIRA ID:", jiraId);
if (jiraId) {
  // getIssue(jiraId).then((issue) => {
  //   const issueStatus = issue.fields.status.name;
  //   console.log("JIRA Issue Status:", issueStatus);
  //   if (issueStatus === "To Do" || issueStatus === "Open") {
  //     changeJiraStatus(jiraId, "In Progress").then(() => {
  //       console.log(`JIRA Issue ${jiraId} status changed to "In Progress".`);
  //     }).catch((error) => {
  //       console.error("Error changing JIRA issue status:", error);
  //     });
  //   }
  // }).catch(console.error);
  const jiraUrl = `https://hclsw-jirads.atlassian.net/browse/${jiraId}`;
  const jiraLink = `[${jiraId}](${jiraUrl})`;
  jiraSection = `### 🎟️ Jira Ticket\n${jiraLink}`;
}else{
  console.log("No JIRA ID found in PR title.");
}
// --- 5. Define the new AI Summary section ---
let aiSummarySection = `### 🤖 AI Summary\nThis section was automatically added. AI summary will be added here.`;
const prData = await getPRGitData(owner, repo, pull_request.number, token);
const aiSummary = await askAI(JSON.stringify(prData), PR_DESCRIPTION_PROMPT);
if (aiSummary) {
  aiSummarySection = `### 🤖 AI Summary\n${aiSummary}`;
} else {
  console.log("No AI summary generated.");
}

// --- 6. Construct the new PR body ---
const currentBody = pull_request.body || '';

// This is the new, more robust separator. It includes a visible and an invisible part.
const botSeparator = "\n\n---\n*✍️ The content below is auto-generated and will be overwritten. Do not edit manually.*\n";
let userDescription = currentBody;

const markerIndex = currentBody.indexOf("---");
if (markerIndex !== -1) {
  // If marker exists, everything before it is the user's description
  userDescription = currentBody.substring(0, markerIndex);
}

// Assemble all the bot's content into one block
const botContent = jiraSection + "\n\n" + aiSummarySection + "\n\n"+ `*Last updated: ${new Date().toLocaleString()}*`;

// Assemble the new body using the full separator
const newBody = userDescription.trim() + botSeparator + "\n\n" + botContent;

updatePrDescription(owner, repo, pull_request.number, newBody)
.then(() => console.log("PR description updated!"))
.catch(console.error);
