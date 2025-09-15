import fs from 'fs';
import { execSync } from 'child_process';
import { parseFilesFromDiff, type FileChange } from './diffParser.js';
import { CONFIG } from '../config.js';

export interface BasicCommit {
  sha: string;
  message: string;
  timestamp: string;
}

export interface DetailedCommit {
  sha: string;
  message: string;
  timestamp: string;
  files: FileChange[];
}

export function getCurrentBranchName(branchRef?: string): string {
  if (branchRef) {
    // If a branchRef is provided, use it directly after cleaning it up.
    return branchRef.replace('refs/heads/', '');
  } else {
    // If no branchRef is provided, get the current branch name using the utility function.
    try {
      return execSync(`git rev-parse --abbrev-ref HEAD`, {
        encoding: 'utf8',
      }).trim();
    } catch (error) {
      throw new Error(`Failed to get the branch name.`);
    }
  }
}

// Get commits from GitHub event payload
export function getCommitsFromGitHubEvent(): BasicCommit[] {
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
export function getCommitsFromGit(): BasicCommit[] {
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
        gitOutput = execSync('git log -10 --format="%H|%s|%ct" @{u}..', {
          encoding: 'utf8',
        }).trim();
      }
    } else {
      console.log('No valid SHA range, using recent commits');
      gitOutput = execSync('git log -10 --format="%H|%s|%ct" @{u}..', {
        encoding: 'utf8',
      }).trim();
    }

    if (!gitOutput) {
      console.log('No git output found');
      return [];
    }

    console.log('GIT OUTPUT', gitOutput);
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
export function getCommitsFromPush(): BasicCommit[] {
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
export function findFlaggedCommits(commits: BasicCommit[]): BasicCommit[] {
  return commits.filter((commit) =>
    commit.message.includes(`${CONFIG.commitMessageFlag || '[autocomment]'}`)
  );
}

// Get detailed file change data for a specific commit
export function getCommitDetails(commit: BasicCommit): DetailedCommit {
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

export function getCurrentRemoteUrl() {
  return execSync('git config --get remote.origin.url', { encoding: 'utf8' });
}
