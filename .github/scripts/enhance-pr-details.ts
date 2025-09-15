import { Octokit } from "@octokit/rest";
import fs from "fs";

// Load event payload
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

// Usage example:
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