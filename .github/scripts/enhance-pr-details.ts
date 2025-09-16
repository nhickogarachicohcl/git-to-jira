import { Octokit } from "@octokit/rest";
import fs from "fs";
import { extractJiraKey } from "../../src/git/jiraParser";
import { getPRGitData, updatePrDescription, composeJiraSection, composeAISummary } from "../../src/git/PRdata";


//Load event payload
const eventPath = process.env.GITHUB_EVENT_PATH!;
const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const token = process.env.GITHUB_TOKEN!;

const owner = event.repository.owner.login;
const repo = event.repository.name;
const pull_request = event.pull_request;

console.log("Updating PR description...");
console.log("owner:", owner);
console.log("repo:", repo);
console.log("pull_request number:", pull_request.number);

//Update Jira issue status to "In Progress" if it's currently "To Do" or "Open"
const prTitle = pull_request.title || pull_request.base?.title || pull_request.head?.title;
console.log("PR Title:", prTitle);
// --- 1. Extract Jira Ticket and Create Link ---
const jiraId = extractJiraKey(prTitle || "") ?? "";
console.log("Extracted JIRA ID:", jiraId);
let jiraSection = await composeJiraSection(jiraId) ?? '';

// --- 2. Define the new AI Summary section ---
const prData = await getPRGitData(owner, repo, pull_request.number, token);
let aiSummarySection = await composeAISummary(prData) ?? '';

// --- 3. Construct the new PR body ---
const currentBody = pull_request.body || '';
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

updatePrDescription(owner, repo, pull_request.number, newBody, token)
.then(() => console.log("PR description updated!"))
.catch(console.error);
