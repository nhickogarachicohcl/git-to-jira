import axios from './rest.js';
import { handleError } from './utils.js';

export async function getIssue(issueID: string): Promise<any> {
  try {
    const res = await axios.get(`/issue/${issueID}`);
    return res.data;
  } catch (error) {
    console.error('Error response:', (error as any).response);
    handleError('get issue', error);
  }
}

export async function addComment(
  issueID: string,
  comment: string
): Promise<void> {
  try {
    await axios.post(`/issue/${issueID}/comment`, { body: comment });
  } catch (error) {
    handleError('add comment', error);
  }
}

export async function changeStatus(
  issueID: string,
  statusId: string
): Promise<void> {
  try {
    await axios.post(`/issue/${issueID}/transitions`, {
      transition: { id: statusId },
    });
  } catch (error) {
    handleError('change status', error);
  }
}
