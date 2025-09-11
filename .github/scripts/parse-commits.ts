import { execSync } from 'child_process';
import { parseFilesFromDiff, FileChange } from '../../src/utils/diffParser.js';
import { extractJiraKey } from '../../src/utils/jiraParser.js';

// Type definitions
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

// Get commits from the latest push
function getCommitsFromPush(): BasicCommit[] {
  try {
    // Get the exact commit range from GitHub push event
    const beforeSha = process.env.GITHUB_SHA_BEFORE;
    const afterSha = process.env.GITHUB_SHA;
    
    let gitOutput: string;
    
    if (beforeSha && afterSha && beforeSha !== '0000000000000000000000000000000000000000') {
      // Use push range
      console.log(`Getting commits from GitHub push range: ${beforeSha}..${afterSha}`);
      gitOutput = execSync(`git log ${beforeSha}..${afterSha} --format="%H|%s|%ct"`, { encoding: 'utf8' }).trim();
    } else {
      // Fallback for new branches or when GitHub vars unavailable
      console.log('Using fallback: recent commits');
      gitOutput = execSync('git log -10 --format="%H|%s|%ct"', { encoding: 'utf8' }).trim();
    }
    
    // Handle no commits in range
    if (!gitOutput) {
      console.log('No commits found in range');
      return [];
    }
    
    const commits = gitOutput
      .split('\n')
      .map(line => {
        const [sha, message, timestamp] = line.split('|');
        return { 
          sha, 
          message, 
          timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };
      });
    
    return commits;
  } catch (error) {
    console.error('Error getting commits:', (error as Error).message);
    // Final fallback to recent commits
    try {
      console.log('Final fallback to recent commits...');
      const commits = execSync('git log -5 --format="%H|%s|%ct"', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .map(line => {
          const [sha, message, timestamp] = line.split('|');
          return { 
            sha, 
            message, 
            timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
          };
        });
      return commits;
    } catch (fallbackError) {
      console.error('Final fallback also failed:', (fallbackError as Error).message);
      return [];
    }
  }
}

// Filter for flagged commits
function findFlaggedCommits(commits: BasicCommit[]): BasicCommit[] {
  return commits.filter(commit => 
    commit.message.startsWith('[autocomment]')
  );
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
      files: files
    };
  } catch (error) {
    console.error(`Error getting diff for ${commit.sha}:`, (error as Error).message);
    // Return commit with empty files array on error
    return {
      sha: commit.sha,
      message: commit.message,
      timestamp: commit.timestamp,
      files: []
    };
  }
}

// Format final JSON output
function formatForLLM(jiraKey: string | null, branchRef: string, flaggedCommits: BasicCommit[]): LLMOutput {
  const branchName = branchRef.replace('refs/heads/', '');
  
  // Get detailed data for each commit
  const commitDetails = flaggedCommits.map(getCommitDetails);
  
  // Calculate total commits and file changes
  const totalCommits = commitDetails.length;
  const totalFilesChanged = commitDetails.reduce((total, commit) => 
    total + commit.files.length, 0
  );

  return {
    jiraKey: jiraKey,
    branchName: branchName,
    summary: {
      totalCommits: totalCommits,
      totalFilesChanged: totalFilesChanged,
      commits: commitDetails
    }
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
    console.log(`${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`);
  });
  
  // Generate final JSON output
  const llmData = formatForLLM(jiraKey, ref, flaggedCommits);
  
  console.log('\n=== LLM DATA OUTPUT ===');
  console.log(JSON.stringify(llmData, null, 2));
  console.log('=== END LLM DATA ===');
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}