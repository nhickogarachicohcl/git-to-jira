import { get, addComment, changeStatus } from './issues.js';
import { getTransitions } from './references.js';
import { handleError } from './utils.js';

async function addJiraComment(jiraId, comment) {
    try {
        await addComment(jiraId, comment);
    } catch (error) {
        handleError('adding comment', error);
    }
}

async function changeJiraStatus(jiraId, newStatus) {
    try {
        const transitions = await getTransitions(jiraId);
        let newStatusId = transitions[newStatus];
        changeStatus(jiraId, newStatusId);
    } catch (error) {
        handleError('changing status', error);
    }
}

async function getJiraIssue(jiraId) {
    try {
        const issue = await get(jiraId);
        console.log('Fetched Issue:', JSON.stringify(issue, null, 2));
    } catch (error) {
        handleError('fetching issue', error);
    }
}

let jiraId = "DXQ-45657"; // Example Jira issue key
let comment = "NEW -----This is a test comment added via API.";
let newStatus = "In Code Review"; // Example status name
changeJiraStatus(jiraId, newStatus);
addJiraComment(jiraId, comment);
getJiraIssue(jiraId);
