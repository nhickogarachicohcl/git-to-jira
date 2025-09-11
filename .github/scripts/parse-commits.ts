import { execSync } from 'child_process';

// Type definitions
interface BasicCommit {
  sha: string;
  message: string;
  timestamp: string;
}

interface FileChange {
  path: string;
  changes: string;
  diff: string;
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

// Extract Jira key from branch name
function extractJiraKey(branchRef: string): string | null {
  const branchName = branchRef.replace('refs/heads/', '');
  const jiraMatch = branchName.match(/([A-Z]+-\d+)/);
  return jiraMatch ? jiraMatch[1] : null;
}

// Get commits from the latest push
function getCommitsFromPush(): BasicCommit[] {
  try {
    // Get the exact commit range between last commit in the branch before the push
    // and the final commit in the current push
    const beforeSha = process.env.GITHUB_SHA_BEFORE || 'HEAD~1';
    const afterSha = process.env.GITHUB_SHA || 'HEAD';
    
    console.log(`Getting commits from ${beforeSha}..${afterSha}`);
    
    // Returns commits from the range
    const gitOutput = execSync(`git log ${beforeSha}..${afterSha} --format="%H|%s|%ct"`, { encoding: 'utf8' })
      .trim();
    
    // Handle no commits in range
    if (!gitOutput) {
      console.log('No commits found in push range');
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
    // Fallback to recent commits if git range fails
    try {
      console.log('Falling back to recent commits...');
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
      console.error('Fallback also failed:', (fallbackError as Error).message);
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

// Parse files and diffs from git show output
function parseFilesFromDiff(diffOutput: string): FileChange[] {
  const files: FileChange[] = [];
  const lines = diffOutput.split('\n');
  
  let currentFile: string | null = null;
  let currentDiff: string[] = [];
  let addedLines = 0;
  let removedLines = 0;
  
  for (const line of lines) {
    // Look for file headers - each file's diff starts with "diff --git"
    if (line.startsWith('diff --git')) {
      // Before starting a new file, save the data collected for the previous file
      if (currentFile) {
        files.push({
          path: currentFile,
          changes: `+${addedLines}/-${removedLines}`,
          diff: currentDiff.join('\n')
        });
      }
      
      // Start new file by extracting file path
      // e.g. from diff --git a/src/styles.css b/src/styles.css, extracts src/styles.css
      const match = line.match(/diff --git a\/(.+) b\/(.+)/);
      currentFile = match ? match[1] : 'unknown';
      currentDiff = [line];
      addedLines = 0;
      removedLines = 0;
    } else if (currentFile) {
      currentDiff.push(line);
      
      // Count changes
      if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removedLines++;
      }
    }
  }
  
  // Save the last file when loop ends
  if (currentFile) {
    files.push({
      path: currentFile,
      changes: `+${addedLines}/-${removedLines}`,
      diff: currentDiff.join('\n')
    });
  }
  
  return files;
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