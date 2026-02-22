import axios, { type AxiosInstance } from 'axios';
import { CriticalError, ExpectedError } from './types/errors';
import { ERROR_TYPE } from './constants/errors';

interface StreamableAxiosInstance extends AxiosInstance {
  stream: (url: string, request: any, signal: AbortSignal) => Promise<Response>;
}

/**
 * WebView API client - for use in embedded webviews (Flutter, native apps)
 *
 * Key differences from regular API client:
 * - Does NOT send credentials (no cookies)
 * - Does NOT dispatch auth:unauthorized events
 * - Designed for public/unauthenticated endpoints
 *
 * Use cases:
 * - Flutter WebView (MindmapEmbedPage)
 * - Presentation generation WebView (GenerationRemoteApp)
 * - Any other embedded webview scenarios
 */
const webViewApi: StreamableAxiosInstance = axios.create({
  allowAbsoluteUrls: true,
  withCredentials: false, // DO NOT send cookies with requests
}) as StreamableAxiosInstance;

webViewApi.stream = async function (url: string, request: any, signal: AbortSignal) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    };

    // Add Authorization header if token is available from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('WebViewAPI Request:', { url, request });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal,
      credentials: 'omit', // DO NOT send cookies with fetch requests
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

        const error = new ExpectedError(errorMessage, ERROR_TYPE.API_ERROR, response.status.toString(), {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data: responseData,
        });

        console.error('[WebViewAPI]', error);
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

// Request interceptor to set Content-Type based on data type
webViewApi.interceptors.request.use((config) => {
  // Only set Content-Type for requests with data
  if (config.data !== undefined) {
    // Let axios handle Content-Type for FormData (sets multipart/form-data with boundary)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
});

// Request interceptor to add Authorization header
webViewApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage (injected by Flutter)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

webViewApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        // Handle expected errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return Promise.reject(
            new ExpectedError(
              response.data.message || 'An error occurred',
              ERROR_TYPE.API_ERROR,
              response.status.toString(),
              response.data
            )
          );
        }

        // Handle critical errors (5xx)
        const errorMessage = response.data?.message || 'A server error occurred. Please try again.';

        return Promise.reject(
          new CriticalError(errorMessage, ERROR_TYPE.API_ERROR, response.status.toString(), response.data)
        );
      }
    }
    return Promise.reject(new CriticalError('Network or unexpected error occurred', ERROR_TYPE.NETWORK));
  }
);

export default webViewApi;
