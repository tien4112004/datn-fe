import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiServiceFactory, type Service } from '@/shared/api/base-service';

// Mock the useApiSwitching hook
const mockUseApiSwitching = vi.fn();
vi.mock('@/context/api-switching', () => ({
  useApiSwitching: mockUseApiSwitching,
}));

// Mock service classes for testing
interface TestService extends Service {
  getName(): string;
}

class MockTestService implements TestService {
  getName(): string {
    return 'Mock Service';
  }
}

class RealTestService implements TestService {
  getName(): string {
    return 'Real Service';
  }
}

// Another service type for generic testing
interface AnotherService extends Service {
  getType(): string;
}

class MockAnotherService implements AnotherService {
  getType(): string {
    return 'Mock Another';
  }
}

class RealAnotherService implements AnotherService {
  getType(): string {
    return 'Real Another';
  }
}

describe('createApiServiceFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns MockService when apiMode is mock', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: 'mock' });

    const service = createApiServiceFactory(MockTestService, RealTestService);

    expect(service).toBeInstanceOf(MockTestService);
    expect(service.getName()).toBe('Mock Service');
  });

  it('returns RealService when apiMode is real', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: 'real' });

    const service = createApiServiceFactory(MockTestService, RealTestService);

    expect(service).toBeInstanceOf(RealTestService);
    expect(service.getName()).toBe('Real Service');
  });

  it('works with different service types', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: 'mock' });

    const service = createApiServiceFactory(MockAnotherService, RealAnotherService);

    expect(service).toBeInstanceOf(MockAnotherService);
    expect(service.getType()).toBe('Mock Another');
  });

  it('maintains proper service interface', () => {
    mockUseApiSwitching.mockReturnValue({ apiMode: 'mock' });

    const service = createApiServiceFactory(MockTestService, RealTestService);

    // Service should implement the Service interface
    expect(typeof service).toBe('object');
    expect(service).toHaveProperty('getName');
    expect(typeof service.getName).toBe('function');
  });

  it('handles service instantiation correctly', () => {
    // Test both modes to ensure proper instantiation
    mockUseApiSwitching.mockReturnValue({ apiMode: 'mock' });
    const mockService = createApiServiceFactory(MockTestService, RealTestService);
    
    mockUseApiSwitching.mockReturnValue({ apiMode: 'real' });
    const realService = createApiServiceFactory(MockTestService, RealTestService);

    expect(mockService).toBeInstanceOf(MockTestService);
    expect(realService).toBeInstanceOf(RealTestService);
    expect(mockService).not.toBe(realService);
    expect(mockService.getName()).not.toBe(realService.getName());
  });
});