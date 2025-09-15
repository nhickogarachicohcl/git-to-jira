import { Octokit } from "@octokit/rest";

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