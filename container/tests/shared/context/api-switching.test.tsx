import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiSwitchingProvider, useApiSwitching } from '@/shared/context/api-switching';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Test component to use the hook
const TestComponent = () => {
  const { apiMode, setApiMode } = useApiSwitching();
  
  return (
    <div>
      <span data-testid="api-mode">{apiMode}</span>
      <button onClick={() => setApiMode('mock')} data-testid="set-mock">
        Set Mock
      </button>
      <button onClick={() => setApiMode('real')} data-testid="set-real">
        Set Real
      </button>
    </div>
  );
};

// Component to test hook outside provider
const ComponentOutsideProvider = () => {
  useApiSwitching();
  return <div>Should not render</div>;
};

describe('ApiSwitchingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides default mock mode when no localStorage value', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ApiSwitchingProvider>
        <TestComponent />
      </ApiSwitchingProvider>
    );

    expect(screen.getByTestId('api-mode')).toHaveTextContent('mock');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('apiMode');
  });

  it('loads saved mode from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('real');
    
    render(
      <ApiSwitchingProvider>
        <TestComponent />
      </ApiSwitchingProvider>
    );

    expect(screen.getByTestId('api-mode')).toHaveTextContent('real');
  });

  it('updates API mode when setApiMode is called', () => {
    render(
      <ApiSwitchingProvider>
        <TestComponent />
      </ApiSwitchingProvider>
    );

    act(() => {
      screen.getByTestId('set-real').click();
    });

    expect(screen.getByTestId('api-mode')).toHaveTextContent('real');
  });

  it('persists mode change to localStorage', () => {
    render(
      <ApiSwitchingProvider>
        <TestComponent />
      </ApiSwitchingProvider>
    );

    act(() => {
      screen.getByTestId('set-real').click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('apiMode', 'real');
  });

  it('throws error when hook used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useApiSwitching must be used within ApiSwitchingProvider');
    
    consoleSpy.mockRestore();
  });

  it('handles invalid localStorage values gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-value');
    
    render(
      <ApiSwitchingProvider>
        <TestComponent />
      </ApiSwitchingProvider>
    );

    // Should default to 'mock' when invalid value in localStorage
    expect(screen.getByTestId('api-mode')).toHaveTextContent('mock');
  });
});