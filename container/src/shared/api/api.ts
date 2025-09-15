import axios, { type AxiosInstance } from 'axios';
import { CriticalError, ExpectedError } from '@/shared/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { toast } from 'sonner';

interface StreamableAxiosInstance extends AxiosInstance {
  stream: (url: string, request: any, signal: AbortSignal) => Promise<Response>;
}

const api: StreamableAxiosInstance = axios.create({
  allowAbsoluteUrls: true,
  headers: {
    'Content-Type': 'application/json',
  },
}) as StreamableAxiosInstance;

api.stream = async function (url: string, request: any, signal: AbortSignal) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
      },
      body: JSON.stringify(request),
      signal,
    });

    // Handle HTTP error status codes
    if (!response.ok) {
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

        toast.error(errorMessage);

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
