import fs from 'fs';
import path from 'path';

const PROCESSED_COMMITS_PATH = path.join(
  process.cwd(),
  '.git2jira',
  'git2jira.commits.json'
);

export const getProcessedCommits = () => {
  try {
    console.log('Getting processed commits...');
    return JSON.parse(fs.readFileSync(PROCESSED_COMMITS_PATH, 'utf8'));
  } catch (error) {
    console.log('No processed commits. Returning an empty object.');
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

export const saveProcessedCommits = (
  commits: Record<string, string[]>
): void => {
  console.log('Saving processed commits...');
  console.log(commits);
  const data = JSON.stringify(commits, null, 2);
  fs.mkdirSync(path.dirname(PROCESSED_COMMITS_PATH), { recursive: true });
  fs.writeFileSync(PROCESSED_COMMITS_PATH, data, 'utf-8');
  console.log('Saved processed commits.');
};

export const isCommitProcessed = (
  issueKey: string,
  commitHash: string,
  processedCommits: any
): boolean => {
  console.log(
    `Checking if commit on issue ${issueKey} with hash ${commitHash} has been processed`
  );

  const commitsForIssue = processedCommits[issueKey];
  const isProcessed = commitsForIssue
    ? commitsForIssue.includes(commitHash)
    : false;
  console.log(
    `${isProcessed ? 'Commit has been processed' : "Commit hasn't been processed"} `
  );
  return isProcessed;
};

export const addCommit = (
  issueKey: string,
  commitHash: string,
  processedCommits: any
): void => {
  console.log(
    `Adding commit to git2jira.commits.json on issue ${issueKey} with hash ${commitHash}`
  );

  if (!processedCommits[issueKey]) {
    console.log(
      `Issue ${issueKey} hasn't been added yet. Initializing with empty array.`
    );
    processedCommits[issueKey] = [];
  }

  if (!processedCommits[issueKey].includes(commitHash)) {
    console.log(`Adding commit ${commitHash} to processed commits.`);
    processedCommits[issueKey].push(commitHash);
    saveProcessedCommits(processedCommits);
  }
};
