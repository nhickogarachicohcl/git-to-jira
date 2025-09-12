import { execSync } from 'child_process';
import fs from 'fs';
import { parseFilesFromDiff, FileChange } from '../utils/diffParser.js';
import { extractJiraKey } from '../utils/jiraParser.js';

interface BasicCommit {
  sha: string;
  message: string;
  timestamp: string;
}

interface DetailedCommit {
  sha: string;
  message: string;
  timestamp: string;
  files: FileChange[];
}

interface LLMOutput {
  jiraKey: string | null;
  branchName: string;
  summary: {
    totalCommits: number;
    totalFilesChanged: number;
    commits: DetailedCommit[];
  };
}

// Get GitHub context
const ref: string = process.env.GITHUB_REF || '';
const eventName: string = process.env.GITHUB_EVENT_NAME || '';

console.log('=== GitHub Actions Context ===');
console.log('Ref:', ref);
console.log('Event:', eventName);

// Get commits from GitHub event payload
function getCommitsFromGitHubEvent(): BasicCommit[] {
  try {
    // Check event path that contains the commits for the push event
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.log('No GITHUB_EVENT_PATH found');
      return [];
    }

    console.log('Reading GitHub event payload from:', eventPath);
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

    // Extract commits array from event data
    const commits = eventData.commits || [];
    console.log(`Found ${commits.length} commits in GitHub event payload`);

    if (commits.length === 0) {
      console.log('No commits in GitHub event payload');
      return [];
    }

    // Format the commits
    const formattedCommits = commits.map((commit: any) => ({
      sha: commit.id,
      message: commit.message,
      timestamp: commit.timestamp || new Date().toISOString(),
    }));

    console.log('Commits from GitHub event:');
    formattedCommits.forEach((commit, index) => {
      console.log(
        `  ${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
      );
    });

    return formattedCommits;
  } catch (error) {
    console.error(
      'Error reading GitHub event payload:',
      (error as Error).message
    );
    return [];
  }
}

// Fallback method using git commands
function getCommitsFromGit(): BasicCommit[] {
  try {
    console.log('Using git fallback method...');

    // Try to use GitHub environment variables first
    const beforeSha = process.env.GITHUB_SHA_BEFORE;
    const afterSha = process.env.GITHUB_SHA;

    let gitOutput: string;

    if (
      beforeSha &&
      afterSha &&
      beforeSha !== '0000000000000000000000000000000000000000'
    ) {
      console.log(`Trying git range: ${beforeSha}..${afterSha}`);
      try {
        // Verify the before SHA exists
        execSync(`git cat-file -e ${beforeSha}`, { stdio: 'ignore' });
        gitOutput = execSync(
          `git log ${beforeSha}..${afterSha} --format="%H|%s|%ct"`,
          { encoding: 'utf8' }
        ).trim();

        if (gitOutput) {
          console.log('Successfully used git range');
        } else {
          throw new Error('Empty git range output');
        }
      } catch (rangeError) {
        console.log('Git range failed, falling back to recent commits');
        gitOutput = execSync('git log -10 --format="%H|%s|%ct"', {
          encoding: 'utf8',
        }).trim();
      }
    } else {
      console.log('No valid SHA range, using recent commits');
      gitOutput = execSync('git log -10 --format="%H|%s|%ct"', {
        encoding: 'utf8',
      }).trim();
    }

    if (!gitOutput) {
      console.log('No git output found');
      return [];
    }

    const commits = gitOutput.split('\n').map((line) => {
      const [sha, message, timestamp] = line.split('|');
      return {
        sha,
        message,
        timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      };
    });

    console.log(`Found ${commits.length} commits from git`);
    return commits;
  } catch (error) {
    console.error('Git fallback failed:', (error as Error).message);
    return [];
  }
}

// Main function execution
function getCommitsFromPush(): BasicCommit[] {
  // Try GitHub event payload first
  let commits = getCommitsFromGitHubEvent();

  // Try git commands if event payload fails
  if (commits.length === 0) {
    console.log('GitHub event method failed, trying git fallback...');
    commits = getCommitsFromGit();
  }

  // Final fallback - get recent commits
  if (commits.length === 0) {
    console.log('All methods failed, using final fallback...');
    try {
      const gitOutput = execSync('git log -5 --format="%H|%s|%ct"', {
        encoding: 'utf8',
      }).trim();
      commits = gitOutput.split('\n').map((line) => {
        const [sha, message, timestamp] = line.split('|');
        return {
          sha,
          message,
          timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
        };
      });
    } catch (finalError) {
      console.error('Final fallback failed:', (finalError as Error).message);
      return [];
    }
  }

  return commits;
}

// Filter for flagged commits
function findFlaggedCommits(commits: BasicCommit[]): BasicCommit[] {
  return commits.filter((commit) => commit.message.startsWith('[autocomment]'));
}

// Get detailed file change data for a specific commit
function getCommitDetails(commit: BasicCommit): DetailedCommit {
  try {
    const diffOutput = execSync(`git show ${commit.sha}`, { encoding: 'utf8' });
    const files = parseFilesFromDiff(diffOutput);

    return {
      sha: commit.sha,
      message: commit.message,
      timestamp: commit.timestamp,
      files: files,
    };
  } catch (error) {
    console.error(
      `Error getting diff for ${commit.sha}:`,
      (error as Error).message
    );
    // Return commit with empty files array on error
    return {
      sha: commit.sha,
      message: commit.message,
      timestamp: commit.timestamp,
      files: [],
    };
  }
}

// Format final JSON output
function formatForLLM(
  jiraKey: string | null,
  branchRef: string,
  flaggedCommits: BasicCommit[]
): LLMOutput {
  const branchName = branchRef.replace('refs/heads/', '');

  // Get detailed data for each commit
  const commitDetails = flaggedCommits.map(getCommitDetails);

  // Calculate total commits and file changes
  const totalCommits = commitDetails.length;
  const totalFilesChanged = commitDetails.reduce(
    (total, commit) => total + commit.files.length,
    0
  );

  return {
    jiraKey: jiraKey,
    branchName: branchName,
    summary: {
      totalCommits: totalCommits,
      totalFilesChanged: totalFilesChanged,
      commits: commitDetails,
    },
  };
}

// Main execution
const jiraKey = extractJiraKey(ref);
const allCommits = getCommitsFromPush();
const flaggedCommits = findFlaggedCommits(allCommits);

console.log('\n=== Results ===');
console.log('Jira Key:', jiraKey);
console.log('Total commits:', allCommits.length);
console.log('Flagged commits:', flaggedCommits.length);

if (flaggedCommits.length > 0) {
  console.log('\n=== Processing Commits ===');
  flaggedCommits.forEach((commit, index) => {
    console.log(
      `${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`
    );
  });

  // Generate final JSON output
  const llmData = formatForLLM(jiraKey, ref, flaggedCommits);

  console.log('\n=== LLM DATA OUTPUT ===');
  console.log(JSON.stringify(llmData, null, 2));
  console.log('=== END LLM DATA ===');
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}
