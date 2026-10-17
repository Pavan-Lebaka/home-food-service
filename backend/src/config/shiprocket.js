import axios from 'axios';
import { env } from './env.js';

export const shiprocketAxios = axios.create({
  baseURL: env.SHIPROCKET_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});
