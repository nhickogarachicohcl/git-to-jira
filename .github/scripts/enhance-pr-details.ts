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
const { owner, repo } = event.repository;
const pull_number = event.pull_request.number;
const newDescription = "This PR description was set dynamically by enhance-pr-details.ts";

console.log("Updating PR description...");

console.log("owner:", owner.login || owner.name);
console.log("repo:", repo.name);
console.log("pull_number:", pull_number);
console.log("newDescription:", newDescription);

updatePrDescription(owner.login || owner.name, repo.name, pull_number, newDescription)
  .then(() => console.log("PR description updated!"))
  .catch(console.error);