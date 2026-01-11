import { CriticalError, ExpectedError } from '../types/errors';
import { ERROR_TYPE } from '../constants/errors';
import { AxiosError } from 'axios';

/**
 * Dispatch unauthorized event to notify app of 401 errors
 */
export function dispatchUnauthorizedEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
}

/**
 * Handle fetch Response errors (for streaming)
 */
export async function handleStreamError(response: Response): Promise<never> {
  // Handle 401 Unauthorized
  if (response.status === 401) {
    dispatchUnauthorizedEvent();

    throw new ExpectedError(
      'Session expired. Please login again.',
      ERROR_TYPE.API_ERROR,
      '401',
      {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      }
    );
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

    throw new ExpectedError(
      errorMessage,
      ERROR_TYPE.API_ERROR,
      response.status.toString(),
      {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: responseData,
      }
    );
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

/**
 * Handle Axios errors (for standard requests)
 */
export function handleAxiosError(error: any): Promise<never> {
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    const { response } = axiosError;

    if (response) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        dispatchUnauthorizedEvent();

        return Promise.reject(
          new ExpectedError(
            'Session expired. Please login again.',
            ERROR_TYPE.API_ERROR,
            '401',
            response.data
          )
        );
      }

      // Handle expected errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return Promise.reject(
          new ExpectedError(
            (response.data as any)?.message || 'An error occurred',
            ERROR_TYPE.API_ERROR,
            response.status.toString(),
            response.data
          )
        );
      }

      // Handle critical errors (5xx)
      const errorMessage =
        (response.data as any)?.message ||
        'A server error occurred. Please try again.';

      return Promise.reject(
        new CriticalError(
          errorMessage,
          ERROR_TYPE.API_ERROR,
          response.status.toString(),
          response.data
        )
      );
    }
  }

  return Promise.reject(
    new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK)
  );
}

/**
 * Handle AbortError separately from other errors
 */
export function isAbortError(error: any): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
