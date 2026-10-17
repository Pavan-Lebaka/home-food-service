import morgan from 'morgan';
import { env } from '../config/env.js';

export const requestLogger = morgan(
  env.isDev ? ':method :url :status :res[content-length] - :response-time ms' : 'combined'
);
