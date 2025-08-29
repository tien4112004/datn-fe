import axios, { type AxiosInstance } from 'axios';
import { CriticalError, ExpectedError } from '@/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:8080';

interface StreamableAxiosInstance extends AxiosInstance {
  stream: (url: string, request: any, signal: AbortSignal) => Promise<Response>;
}

const api: StreamableAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) as StreamableAxiosInstance;

api.stream = async function (url: string, request: any, signal: AbortSignal) {
  return await fetch(`${API_BASE_URL}/${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    },
    body: JSON.stringify(request),
    signal,
  });
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        // Handle expected errors
        if (response.status >= 400 && response.status < 500) {
          toast.error(response.data.message || 'An error occurred');

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
            response.data
          )
        );
      }
    }
    // Handle network or unexpected errors
    return Promise.reject(new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK));
  }
);

export default api;
