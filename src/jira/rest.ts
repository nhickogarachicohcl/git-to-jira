import axios from 'axios';
import type { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const _axios = axios.create({
    baseURL: process.env.JIRA_BASE_URL || '',
    headers:{
        common: {
            'Authorization': `Basic ${Buffer.from(process.env.JIRA_USER_EMAIL + ':' + process.env.JIRA_TOKEN).toString('base64')}`,
            'Content-Type': 'application/json'
        }
    }
})

export default _axios;
