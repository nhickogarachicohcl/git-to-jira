
import axios from "./rest.js";

async function get(issueID){
    const res = await axios.get(`/issue/${issueID}`);
    return res.data;
}

async function create(data){
    try {
        if (Array.isArray(data)) {
            const output = [];
            for (let i = 0; i < data.length; i++) {
                let res = await axios.post('/issue', data[i]);
                output.push(res.data);
                //console.log(res);
            }
            return output;
        }
        const res = await axios.post('/issue', data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

async function edit(issues){
    if(Array.isArray(issues)){
        const output = [];
        for (let i = 0; i < issues.length; i++){
            let res = await axios.put(`/issue/${issues[i].id}`, issues[i].data);
            output.push(res.data);
        }
        return output;
    }
    const res = await axios.post(`/issue${issues.id}`,issues.data);
    return res.data;
}

/**
 * Adds a comment to a Jira issue.
 * @param {string} issueID - The Jira issue key (e.g., "DXQ-12345").
 * @param {string} comment - The comment text to add.
 */
async function addComment(issueID, comment) {
    try {
        const res = await axios.post(`/issue/${issueID}/comment`, {
            body: comment
        });
        console.log(`Comment added to ${issueID}:`, res.data);
        return res.data;
    } catch (error) {
        console.error(`Failed to add comment to ${issueID}:`, error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
}

/**
 * Changes the status of a Jira issue by performing a transition.
 * @param {string} issueID - The Jira issue key (e.g., "DXQ-12345").
 * @param {string} transitionID - The ID of the transition to perform.
 */
async function changeStatus(issueID, transitionID) {
    try {
        const res = await axios.post(`/issue/${issueID}/transitions`, {
            transition: { id: transitionID }
        });
        return res.data;
    } catch (error) {
        console.error(`Failed to change status for ${issueID}:`, error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
}

export {
    get,
    create,
    edit,
    addComment,
    changeStatus
}