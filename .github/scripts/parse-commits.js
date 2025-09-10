import { execSync } from 'child_process';

// Get GitHub context
const ref = process.env.GITHUB_REF;
const eventName = process.env.GITHUB_EVENT_NAME;

console.log('=== GitHub Actions Context ===');
console.log('Ref:', ref);
console.log('Event:', eventName);

// Extract Jira key from branch name
function extractJiraKey(branchRef) {
  const branchName = branchRef.replace('refs/heads/', '');
  const jiraMatch = branchName.match(/([A-Z]+-\d+)/);
  return jiraMatch ? jiraMatch[1] : null;
}p

// Get commits from this push
function getCommitsFromPush() {
  try {
    // Get the commit range for this push
    const commits = execSync('git log --oneline -10 --format="%H|%s"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map(line => {
        const [sha, message] = line.split('|');
        return { sha, message };
      });
    
    return commits;
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

// Filter for flagged commits
function findFlaggedCommits(commits) {
  return commits.filter(commit => 
    commit.message.startsWith('[autocomment]')
  );
}

// Get diff for a specific commit
function getCommitDiff(sha) {
  try {
    const diff = execSync(`git show ${sha}`, { encoding: 'utf8' });
    return diff;
  } catch (error) {
    console.error(`Error getting diff for ${sha}:`, error.message);
    return 'Diff not available';
  }
}

const jiraKey = extractJiraKey(ref);
const allCommits = getCommitsFromPush();
const flaggedCommits = findFlaggedCommits(allCommits);

console.log('\n=== Results ===');
console.log('Jira Key:', jiraKey);
console.log('Total commits:', allCommits.length);
console.log('Flagged commits:', flaggedCommits.length);

if (flaggedCommits.length > 0) {
  console.log('\n=== Flagged Commits ===');
  flaggedCommits.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.sha.substring(0, 7)} - ${commit.message}`);
  });
  
  console.log('\n=== Next: Send to LLM ===');
  console.log('This is where we\'d format the data and call the LLM API');
} else {
  console.log('No flagged commits found. Skipping LLM processing.');
}