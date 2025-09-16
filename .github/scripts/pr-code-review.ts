import { Octokit } from '@octokit/rest';
import fs from 'fs';
import { getPRGitData } from '../../src/git/PRdata.js';
import { askAI } from '../../src/llm/index.js';

// Load event payload
const eventPath = process.env.GITHUB_EVENT_PATH!;
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

const token = process.env.GITHUB_TOKEN!;
const octokit = new Octokit({ auth: token });

async function postReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  reviewContent: string
) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body: reviewContent,
  });
}

// Only handle issue_comment events with /review command
if (event.action !== 'created' || !event.comment || !event.issue.pull_request) {
  console.log('Not a comment on a PR, skipping...');
  process.exit(0);
}

// Check if comment is exactly "/review"
const commentBody = event.comment.body.trim();
if (commentBody !== '/review') {
  console.log("Comment is not exactly '/review', skipping...");
  process.exit(0);
}

const owner = event.repository.owner.login;
const repo = event.repository.name;
const pull_number = event.issue.number;

console.log('Processing code review request...');
console.log('Owner:', owner);
console.log('Repo:', repo);
console.log('PR Number:', pull_number);

try {
  // Get PR data
  const prData = await getPRGitData(owner, repo, pull_number, token);

  // Filter out package.json and other files to be excluded
  const filteredFiles = prData.files.filter(
    (file) =>
      !file.filename.includes('package.json') &&
      !file.filename.includes('package-lock.json')
  );

  if (filteredFiles.length === 0) {
    console.log('No files to review after filtering');
    process.exit(0);
  }

  // Prepare data for AI review
  const reviewData = {
    ...prData,
    files: filteredFiles,
  };

  // Code review promp
  const CODE_REVIEW_PROMPT = `
You are an experienced code reviewer. Analyze the provided PR data and give a comprehensive code review focused on code quality, best practices, and maintainability.

Structure your response with these sections:
- **Review Summary**: High-level overview of the changes and overall quality
- **Recommendations**: Specific suggestions for improvements, if any
- **Files Reviewed**: List of files analyzed

Focus on:
- Code structure and organization
- Error handling
- Performance considerations
- TypeScript/JavaScript best practices
- Code readability and maintainability
- Potential bugs or issues

Be constructive and specific in your feedback. If the code looks good, say so.
`;

  // Get AI review
  console.log('Requesting AI code review...');
  const aiReview = await askAI(JSON.stringify(reviewData), CODE_REVIEW_PROMPT);

  if (!aiReview) {
    console.error('Failed to get AI review');
    process.exit(1);
  }

  // Format the final comment
  const reviewComment = `🔍 **Code Review Results**

${aiReview}

---
*Review requested via /review command*`;

  // Post the review comment
  await postReviewComment(owner, repo, pull_number, reviewComment);
  console.log('Code review comment posted successfully!');
} catch (error) {
  console.error('Error during code review process:', error);
  process.exit(1);
}
