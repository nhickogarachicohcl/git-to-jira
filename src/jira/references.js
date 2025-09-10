import axios from "./rest.js";
import { handleError, mapNameToId } from "./utils.js"


async function getIssueTypes() {
    try {
        const res = await axios.get(`/issuetype`);
        return res.data;
    } catch (error) {
        handleError('fetching issue types', error);
    }
}


async function getProjects() {
    try {
        const res = await axios.get(`/project`);
        return res.data;
    } catch (error) {
        handleError('fetching projects', error);
    }
}


async function getComponents(projectId) {
    try {
        const res = await axios.get(`/project/${projectId}/components`);
        return res.data;
    } catch (error) {
        handleError(`fetching components for ${projectId}`, error);
    }
}


async function getPriority() {
    try {
        const res = await axios.get(`/priority`);
        return res.data;
    } catch (error) {
        handleError('fetching priority', error);
    }
}



async function getIssueTypesObj(log = false) {
    try {
        const issueTypes = await getIssueTypes();
        const issueTypesObject = mapNameToId(issueTypes);
        if (log) console.log('Issue Types Object:', JSON.stringify(issueTypesObject, null, 2));
        return issueTypesObject;
    } catch (error) {
        handleError('displaying issue types', error);
    }
}


async function getProjectsObj(log = false) {
    try {
        const projects = await getProjects();
        const projectsObject = mapNameToId(projects);
        if (log) console.log('Projects Object:', JSON.stringify(projectsObject, null, 2));
        return projectsObject;
    } catch (error) {
        handleError('displaying projects', error);
    }
}


async function getComponentsObj(projectId, log = false) {
    try {
        const components = await getComponents(projectId);
        const componentsObject = mapNameToId(components);
        if (log) console.log('Components of', projectId, ':', JSON.stringify(componentsObject, null, 2));
        return componentsObject;
    } catch (error) {
        handleError(`displaying components for ${projectId}`, error);
    }
}


async function getPriorityObj(log = false) {
    try {
        const prio = await getPriority();
        const prioObject = mapNameToId(prio);
        if (log) console.log('Priority Object:', JSON.stringify(prioObject, null, 2));
        return prioObject;
    } catch (error) {
        handleError('displaying priority', error);
    }
}

async function getTransitions(issueID, log = false) {
    try {
        const res = await axios.get(`/issue/${issueID}/transitions`);
        const transitions = res.data.transitions || [];
        const transitionObj = mapNameToId(transitions);
        if (log) console.log('Transitions:', JSON.stringify(transitionObj, null, 2));
        return transitionObj;
    } catch (error) {
        handleError(`fetching transitions for ${issueID}`, error);
    }
}


export {
    getIssueTypesObj,
    getProjectsObj,
    getComponentsObj,
    getPriorityObj,
    getTransitions
}