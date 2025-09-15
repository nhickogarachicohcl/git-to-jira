import { getIssue, addComment, changeStatus } from './issues.js';
import { getTransitions } from './references.js';
import { handleError } from './utils.js';

async function addJiraComment(jiraId: string, comment: string): Promise<void> {
  try {
    await addComment(jiraId, comment);
    console.log(`Comment added to issue ${jiraId}.`);
  } catch (error) {
    handleError('adding comment', error);
  }
}

async function changeJiraStatus(
  jiraId: string,
  newStatus: string
): Promise<void> {
  try {
    const transitions = await getTransitions(jiraId);
    const newStatusId = transitions[newStatus];
    if (typeof newStatusId === 'string') {
      await changeStatus(jiraId, newStatusId);
      console.log(`Issue ${jiraId} successfully changed to '${newStatus}'.`);
    } else {
      ``;
      handleError(
        'changing status',
        new Error(`Status ID for '${newStatus}' not found.`)
      );
    }
  } catch (error) {
    handleError('changing status', error);
  }
}

async function getJiraIssue(jiraId: string): Promise<void> {
  try {
    const issue = await getIssue(jiraId);
    console.log('Fetched Issue:', JSON.stringify(issue, null, 2));
  } catch (error) {
    handleError('fetching issue', error);
  }
}
