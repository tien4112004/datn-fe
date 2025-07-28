import axios from 'axios';
import { CriticalError, ERROR_TYPE, ExpectedError } from '@/types/errors';

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        // Handle expected errors
        if (response.status >= 400 && response.status < 500) {
          return Promise.reject(
            new ExpectedError(
              response.data.message,
              ERROR_TYPE.API_ERROR,
              response.status.toString(),
              response.data
            )
          );
        }

        // Handle critical errors
        return Promise.reject(
          new CriticalError(
            'Critical API error occurred',
            ERROR_TYPE.API_ERROR,
            response.status.toString(),
            ...response.data
          )
        );
      }
    }
    // Handle network or unexpected errors
    return Promise.reject(new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK));
  }
);

export default api;
export * from './base-service';
