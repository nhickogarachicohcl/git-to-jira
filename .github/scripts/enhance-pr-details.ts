import { Octokit } from "@octokit/rest";
import fs from "fs";
import { extractJiraKey } from "../../src/git/jiraParser";
import { getIssue } from "../../src/jira/issues";
import { changeJiraStatus } from "../../src/jira/updateJira";

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

let jiraSection = '';

const owner = event.repository.owner.login;
const repo = event.repository.name;
const pull_request = event.pull_request;
const newDescription = "This PR description was set dynamically by enhance-pr-details.ts";

console.log("Updating PR description...");

console.log("owner:", owner);
console.log("repo:", repo);
console.log("pull_request.number:", pull_request.number);
console.log("newDescription:", newDescription);

updatePrDescription(owner, repo, pull_request.number, newDescription)
  .then(() => console.log("PR description updated!"))
  .catch(console.error);


//Update Jira issue status to "In Progress" if it's currently "To Do" or "Open"
const prTitle = pull_request.title || pull_request.base?.title || pull_request.head?.title;
console.log("PR Title:", prTitle);

const jiraId = extractJiraKey(prTitle || "");
console.log("Extracted JIRA ID:", jiraId);
if (jiraId) {
  getIssue(jiraId).then((issue) => {
    const issueStatus = issue.fields.status.name;
    console.log("JIRA Issue Status:", issueStatus);
    if (issueStatus === "To Do" || issueStatus === "Open") {
      changeJiraStatus(jiraId, "In Progress").then(() => {
        console.log(`JIRA Issue ${jiraId} status changed to "In Progress".`);
      }).catch((error) => {
        console.error("Error changing JIRA issue status:", error);
      });
    }
    const jiraUrl = `https://hclsw-jirads.atlassian.net/browse/${jiraId}`;
    const jiraLink = `[${jiraId}](${jiraUrl})`;
    jiraSection = `### 🎟️ Jira Ticket\n${jiraLink}`;
    console.log("JIRA Section to add to PR description:\n", jiraSection);
  }).catch(console.error);
}else{
  console.log("No JIRA ID found in PR title.");
}