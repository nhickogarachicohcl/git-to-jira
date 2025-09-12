import axios from './rest.js';
import { handleError } from './utils.js';

export async function getTransitions(
  issueID: string
): Promise<Record<string, string>> {
  try {
    const url = `/issue/${issueID}/transitions`;
    const res = await axios.get(url);
    // Assuming the response contains a mapping of status names to IDs
    return res.data.transitions.reduce(
      (acc: Record<string, string>, t: any) => {
        acc[t.name] = t.id;
        return acc;
      },
      {}
    );
  } catch (error: any) {
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    handleError('get transitions', error);
    return {};
  }
}
