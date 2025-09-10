import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const _axios = axios.create({
    baseURL: 'https://hclsw-jirads.atlassian.net/rest/api/2/',
    headers:{
        common: {
            'Authorization': `Basic ${Buffer.from(process.env.JIRA_USER_EMAIL + ':' + process.env.JIRA_TOKEN).toString('base64')}`,
            'Content-Type': 'application/json'
        }
    }
})

export default _axios;