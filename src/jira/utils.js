// Utility functions for Jira API modules

/**
 * Maps an array of objects with 'name' and 'id' properties to an object { name: id }
 * @param {Array} array - Array of objects with 'name' and 'id'
 * @returns {Object}
 */
function mapNameToId(array) {
    return array.reduce((acc, item) => {
        acc[item.name] = item.id;
        return acc;
    }, {});
}

/**
 * Centralized error handler for API calls
 * @param {string} context - Description of where the error occurred
 * @param {Error} error - The error object
 */
function handleError(context, error) {
    console.error(`Error ${context}:`, error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
}

export { mapNameToId, handleError };
