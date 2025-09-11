import axios from 'axios';
import { JIRA_BASE_URL, JIRA_TOKEN, JIRA_USER_EMAIL } from '../config.js';
import dotenv from 'dotenv';
dotenv.config();

const _axios = axios.create({
  baseURL: JIRA_BASE_URL || '',
  headers: {
    common: {
      Authorization: `Basic ${Buffer.from(JIRA_USER_EMAIL + ':' + JIRA_TOKEN).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  },
});

export default _axios;
