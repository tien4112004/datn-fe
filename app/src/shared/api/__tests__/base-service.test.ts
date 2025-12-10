import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiServiceFactory, type Service } from '@/shared/api/base-service';
import { API_MODE, type ApiMode } from '@aiprimary/api';

// Mock the useApiSwitching hook
vi.mock('@/context/api-switching', () => ({
  useApiSwitching: vi.fn(),
}));

import { useApiSwitching } from '@/context/api-switching';
const mockUseApiSwitching = vi.mocked(useApiSwitching);

// Mock service classes for testing
interface TestService extends Service {
  getName(): string;
}

class MockTestService implements TestService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return 'mock';
  }
  getName(): string {
    return 'Mock Service';
  }
}

class RealTestService implements TestService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return 'real';
  }
  getName(): string {
    return 'Real Service';
  }
}

// Another service type for generic testing
interface AnotherService extends Service {
  getServiceMode(): string;
}

class MockAnotherService implements AnotherService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return 'mock';
  }
  getServiceMode(): string {
    return 'Mock Service Mode';
  }
}

class RealAnotherService implements AnotherService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return 'real';
  }
  getServiceMode(): string {
    return 'Real Service Mode';
  }
}

describe('createApiServiceFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns MockService when apiMode is mock', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.mock, setApiMode: vi.fn() });

    const service = createApiServiceFactory(MockTestService, RealTestService, 'test');

    expect(service).toBeInstanceOf(MockTestService);
    expect(service.getName()).toBe('Mock Service');
  });

  it('returns RealService when apiMode is real', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.real, setApiMode: vi.fn() });

    const service = createApiServiceFactory(MockTestService, RealTestService, 'test');

    expect(service).toBeInstanceOf(RealTestService);
    expect(service.getName()).toBe('Real Service');
    expect(service.getType()).toBe('real');
  });

  it('works with different service types', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.mock, setApiMode: vi.fn() });

    const service = createApiServiceFactory(MockAnotherService, RealAnotherService, 'another');

    expect(service).toBeInstanceOf(MockAnotherService);
    expect(service.getServiceMode()).toBe('Mock Service Mode');
  });

  it('maintains proper service interface', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.mock, setApiMode: vi.fn() });

    const service = createApiServiceFactory(MockTestService, RealTestService, 'test');

    // Service should implement the Service interface
    expect(typeof service).toBe('object');
    expect(service).toHaveProperty('getName');
    expect(typeof service.getName).toBe('function');
    expect(service).toHaveProperty('getType');
    expect(typeof service.getType).toBe('function');
    expect(service.getType()).toBe('mock');
  });

  it('handles service instantiation correctly', () => {
    // Test both modes to ensure proper instantiation
    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.mock, setApiMode: vi.fn() });
    const mockService = createApiServiceFactory(MockTestService, RealTestService, 'test');

    mockUseApiSwitching.mockReturnValue({ apiMode: API_MODE.real, setApiMode: vi.fn() });
    const realService = createApiServiceFactory(MockTestService, RealTestService, 'test');

    expect(mockService).toBeInstanceOf(MockTestService);
    expect(realService).toBeInstanceOf(RealTestService);
    expect(mockService).not.toBe(realService);
    expect(mockService.getName()).not.toBe(realService.getName());
  });
});
