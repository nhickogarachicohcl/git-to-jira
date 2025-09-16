# Git-to-Jira: AI-Powered Diff Summaries

## Description

This bot automates Jira comments based on your Git commits. It uses an AI to read your code changes and writes a summary for you.

You just add a flag to your commit message, like `[autocomment]`, and the bot does the rest. It finds the Jira ticket and posts a clear summary of your code changes as a comment.

This saves time and keeps your team informed without extra work.

## How It Works

1. **Developer commits with flag**: `git commit -m "[autocomment] Fix login validation"`
2. **GitHub Actions triggers**: Automatically runs on any push to any branch
3. **Parser extracts data**: Finds flagged commits and gets diff details
4. **AI generates summary**: LLM analyzes code changes and creates readable summary
5. **Posts to Jira**: Comment appears automatically on the relevant ticket

## Architecture

### Git Module (GitHub Actions)

- **Trigger**: Runs on every push to any branch
- **Commit Detection**: Filters for `[autocomment]` flagged commits
- **Jira Key Extraction**: Gets ticket ID from branch name (e.g., `DXQ-45220_feature_branch`)
- **Diff Collection**: Extracts actual code changes using `git show`

## Usage

### For Developers

```bash
# Create feature branch with Jira key
git checkout -b DXQ-45220_implement_user_search

# Make your changes
# ... code changes ...

# Commit with autocomment flag
git commit -m "[autocomment] Implement user search with pagination"

# Push to trigger automation
git push origin DXQ-45220_implement_user_search
```

### Commit Message Format

- **Required**: Start with `[autocomment]` flag
- **Branch naming**: Include Jira key like `ABC-123_description`
- **Example**: `[autocomment] Fix authentication timeout handling`

## Technical Details

### Supported Scenarios

- Multiple commits in single push (batched processing)
- Mix of flagged and non-flagged commits (filters automatically)
- All branch types (feature, hotfix, etc.)

### File Processing

- Extracts individual file changes from combined diff
- Counts additions/deletions per file
- Preserves full diff content for AI analysis
- Handles binary files and renames gracefully

### Error Handling

- Skips problematic files, continues processing others
- Fallback commit detection when GitHub vars unavailable
- Comprehensive logging for debugging

## Development

### Prerequisites

- Node.js 20+
- TypeScript support
- GitHub Actions enabled

Updatessss
