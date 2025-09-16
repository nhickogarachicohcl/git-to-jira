import fs from 'fs';
import path from 'path';

export const DEFAULT_PROCESSED_COMMITS_DIRNAME = '.git2jira';
export const DEFAULT_PROCESSED_COMMITS_FILENAME = 'processed_commits.json';
export const PROCESSED_COMMITS_PATH = path.join(
  process.cwd(),
  DEFAULT_PROCESSED_COMMITS_DIRNAME,
  DEFAULT_PROCESSED_COMMITS_FILENAME
);

export function getProcessedCommits(): object {
  try {
    console.log('Getting processed commits...');
    return JSON.parse(fs.readFileSync(PROCESSED_COMMITS_PATH, 'utf8'));
  } catch (error: unknown) {
    console.log('No processed commits. Returning an empty object.');
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ENOENT') {
        return {};
      }
    }

    throw new Error('An unexpected error occurred: ' + error);
  }
}

export function saveProcessedCommits(commits: Record<string, string[]>): void {
  console.log('Saving processed commits...');
  console.log(commits);
  const data = JSON.stringify(commits, null, 2);
  fs.mkdirSync(path.dirname(PROCESSED_COMMITS_PATH), { recursive: true });
  fs.writeFileSync(PROCESSED_COMMITS_PATH, data, 'utf-8');
  console.log('Saved processed commits.');
}

export function isCommitProcessed(
  issueKey: string,
  commitHash: string,
  processedCommits: any
): boolean {
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
}

export function addCommit(
  issueKey: string,
  commitHash: string,
  processedCommits: any
): void {
  console.log(
    `Adding commit to processed_commits.json on issue ${issueKey} with hash ${commitHash}`
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
}

export function addGitignoreEntry(dirName = DEFAULT_PROCESSED_COMMITS_DIRNAME) {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const entry = `${dirName}`;

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '');
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes(entry)) {
    fs.appendFileSync(gitignorePath, `\n${entry}\n`);
    console.log(`Added "${entry}" to .gitignore.`);
  }
}

export function hasGitRepo() {
  let currentPath = process.cwd();

  // Traverse up the directory tree until the root or a .git directory is found
  while (currentPath !== path.parse(currentPath).root) {
    const gitPath = path.join(currentPath, '.git');
    if (fs.existsSync(gitPath)) {
      return true;
    }
    currentPath = path.dirname(currentPath);
  }

  return false;
}

export function validateEnv(requiredVars: string[]) {
  const missingVars = requiredVars.filter(
    (varName: string) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    const message = `The following required environment variables are missing: ${missingVars.join(', ')}`;
    console.error(message);
    process.exit(1);
  }
}
