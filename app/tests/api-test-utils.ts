import type { ApiClient } from '@aiprimary/api';
import { vi } from 'vitest';

/**
 * Creates a mock API client for testing
 * All methods are vi.fn() mocks that can be configured in tests
 */
export function createMockApiClient(overrides?: Partial<ApiClient>): ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    stream: vi.fn(),
    request: vi.fn(),
    getUri: vi.fn(),
    defaults: {
      headers: {
        common: {},
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      },
      timeout: 0,
    } as any,
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    } as any,
    ...overrides,
  } as unknown as ApiClient;
}

/**
 * Creates a mock response object matching the ApiResponse structure
 */
export function mockApiResponse<T>(data: T, success = true, message = 'Success') {
  return {
    data: {
      success,
      data,
      message,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * Creates a mock error response
 */
export function mockApiError(message: string, status = 400) {
  return {
    response: {
      data: {
        success: false,
        message,
      },
      status,
      statusText: status === 400 ? 'Bad Request' : 'Error',
      headers: {},
      config: {} as any,
    },
    isAxiosError: true,
  };
}
