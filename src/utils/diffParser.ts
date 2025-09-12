// File change interface
export interface FileChange {
  path: string;
  changes: string;
  diff: string;
}

// Parse files and diffs from git show output
export function parseFilesFromDiff(diffOutput: string): FileChange[] {
  if (!diffOutput) {
    console.warn('parseFilesFromDiff: Empty or null diffOutput provided');
    return [];
  }
  
  if (typeof diffOutput !== 'string') {
    console.warn('parseFilesFromDiff: diffOutput must be a string, received:', typeof diffOutput);
    return [];
  }
  
  if (diffOutput.trim().length === 0) {
    console.warn('parseFilesFromDiff: diffOutput is empty or whitespace only');
    return [];
  }
  
  if (!diffOutput.includes('diff --git')) {
    console.warn('parseFilesFromDiff: Input does not appear to be git diff output');
    return [];
  }
  
  // Main parsing logic
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
      currentFile = match?.[1] || 'unknown';
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