import { Octokit } from "@octokit/rest";
import fs from "fs";
import { extractJiraKey, formatForLLM } from "../../src/git/jiraParser";
import { getIssue } from "../../src/jira/issues";
import {
  findFlaggedCommits,
  getCommitsFromGit,
  getCurrentBranchName,
  getCurrentRemoteUrl,
} from '../../src/git/commits';
import { summarizeFile } from '../../src/llm/index';

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

async function getPRSummary() {
  const branchName = getCurrentBranchName();
  const jiraKey = extractJiraKey(branchName);
  const remoteUrl = getCurrentRemoteUrl();
  const flaggedCommits = getCommitsFromGit();

  let llmData;
  if (flaggedCommits.length > 0) {
    console.log('\n=== Processing Commits ===');
    flaggedCommits.forEach((commit, index) => {
      console.log(
        `${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
      );
    });

    // Generate final JSON output
    llmData = formatForLLM(jiraKey, branchName, flaggedCommits, remoteUrl);

    // LLM
    if (llmData && llmData.jiraKey) {
      console.log('\n=== Initializing LLM Summarizer ===');
      try {
          // Summarize changes
          const {
            summary: { commits },
          } = llmData;
          console.log('Summarizing using LLM');
          const summary = await summarizeFile(JSON.stringify(commits));

          if (summary) {
            console.log(`Summarized changes\n${summary}`);
            return summary;
          }
      } catch (error) {
        console.error('Error summarizing changes');
      }
    }
  } else {
    console.log('No flagged commits found. Skipping LLM processing.');
  }
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
getPRSummary().then((summary) => {
  if(summary){
    console.log("AI Summary:", summary);
    aiSummarySection = `\n\n### 🤖 AI Summary\n${summary}`;
  } else {
    console.log("No AI summary generated.");}
}).catch((error) => {
  console.error("Error getting AI summary:", error);
});

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
