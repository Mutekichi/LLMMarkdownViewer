// src/api/apiClient.ts

import axios from 'axios';
import config from '../config/config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

export const isErrorResponse = (data: any): data is { error: string } => {
  return typeof data === 'object' && data !== null && 'error' in data;
};
