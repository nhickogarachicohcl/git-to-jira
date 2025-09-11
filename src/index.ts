import { CONFIG } from './config.js';
import { getIssue } from './jira/issues.js';

console.log('Main index file');
console.log('---CONFIG VARIABLES---');
console.log(CONFIG);

// Get sample jira issue based on config
// console.log('---SAMPLE JIRA ISSUE---');

const sampleIssue = await getIssue(
  `${CONFIG.jira?.ticketPrefixes?.[0] ?? 'DXQ'}-4567`
);

console.log(sampleIssue);
