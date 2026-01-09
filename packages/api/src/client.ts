import axios, { type AxiosInstance } from 'axios';
import { CriticalError, ExpectedError } from './types/errors';
import { ERROR_TYPE } from './constants/errors';

interface StreamableAxiosInstance extends AxiosInstance {
  stream: (url: string, request: any, signal: AbortSignal) => Promise<Response>;
}

const api: StreamableAxiosInstance = axios.create({
  allowAbsoluteUrls: true,
  withCredentials: true, // Enable sending cookies with requests (HttpOnly cookies contain auth tokens)
  headers: {
    'Content-Type': 'application/json',
  },
}) as StreamableAxiosInstance;

api.stream = async function (url: string, request: any, signal: AbortSignal) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    };

    const accessToken = window.localStorage.getItem('access_token');
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal,
      credentials: 'include', // Send HttpOnly cookies with fetch requests
    });

    // Handle HTTP error status codes
    if (!response.ok) {
      // Handle 401 Unauthorized - dispatch event to clear auth
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));

        const error = new ExpectedError('Session expired. Please login again.', ERROR_TYPE.API_ERROR, '401', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });

        console.error(error);
        throw error;
      }

      // Handle expected errors (4xx status codes)
      if (response.status >= 400 && response.status < 500) {
        let errorMessage = 'An error occurred';
        let responseData: any = null;

        try {
          const errorData = await response.text();
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
          responseData = parsedError;
        } catch {
          // If we can't parse the error response, use the default message
        }

        const error = new ExpectedError(errorMessage, ERROR_TYPE.API_ERROR, response.status.toString(), {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data: responseData,
        });

        console.error(error);
        throw error;
      }

      // Handle critical errors (5xx status codes)
      throw new CriticalError(
        'Critical API error occurred',
        ERROR_TYPE.API_ERROR,
        response.status.toString(),
        {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        }
      );
    }

    return response;
  } catch (error) {
    // Handle AbortError separately
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error; // Re-throw abort errors as-is
    }

    // Handle our custom errors
    if (error instanceof ExpectedError || error instanceof CriticalError) {
      throw error; // Re-throw our custom errors as-is
    }

    // Handle network or unexpected errors
    throw new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK);
  }
};

api.interceptors.request.use(
  (config) => {
    const accessToken = window.localStorage.getItem('access_token');
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          // Clear auth data and redirect to login will be handled by the app
          // We'll dispatch a custom event that the app can listen to
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));

          return Promise.reject(
            new ExpectedError(
              'Session expired. Please login again.',
              ERROR_TYPE.API_ERROR,
              '401',
              response.data
            )
          );
        }

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

        // Handle critical errors (5xx)
        // Show toast with backend error message if available
        const errorMessage = response.data?.message || 'A server error occurred. Please try again.';

        return Promise.reject(
          new CriticalError(errorMessage, ERROR_TYPE.API_ERROR, response.status.toString(), response.data)
        );
      }
    }
    return Promise.reject(new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK));
  }
);

export default api;
