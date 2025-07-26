import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '@/shared/components/common/ErrorBoundary';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errorBoundary.title': 'Something went wrong',
        'errorBoundary.description': 'An unexpected error occurred. Please try again.',
        'errorBoundary.errorDetails': 'Error Details',
        'errorBoundary.errorId': 'Error ID',
        'errorBoundary.message': 'Message',
        'errorBoundary.componentStack': 'Component Stack',
        'errorBoundary.tryAgain': 'Try Again',
        'errorBoundary.goHome': 'Go Home',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/test',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock console methods
const mockConsole = {
  group: vi.fn(),
  error: vi.fn(),
  groupEnd: vi.fn(),
};
Object.assign(console, mockConsole);

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({
  shouldThrow = false,
  errorMessage = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="working-component">Working Component</div>;
};

// Custom fallback component for testing
const CustomFallback: React.FC<{
  error: Error;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  errorId: string;
}> = ({ error, resetError, errorId }) => (
  <div data-testid="custom-fallback">
    <p>Custom Error: {error.message}</p>
    <p>Error ID: {errorId}</p>
    <button onClick={resetError}>Custom Reset</button>
  </div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress error boundary console warnings in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.getByText('Working Component')).toBeInTheDocument();
  });

  it('renders default error fallback when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Component crashed" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('displays error details when showDetails is true (default)', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Detailed error message" />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText('Error Details');
    expect(detailsElement).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsElement);

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Message:/)).toBeInTheDocument();
    expect(screen.getByText('Detailed error message')).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    render(
      <ErrorBoundary showDetails={false}>
        <ThrowError shouldThrow={true} errorMessage="Hidden details error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
  });

  it('renders custom fallback component when provided', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} errorMessage="Custom fallback test" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error: Custom fallback test')).toBeInTheDocument();
    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
    expect(screen.getByText('Custom Reset')).toBeInTheDocument();
  });

  it('calls onError callback when an error occurs', () => {
    const onErrorCallback = vi.fn();

    render(
      <ErrorBoundary onError={onErrorCallback}>
        <ThrowError shouldThrow={true} errorMessage="Callback test error" />
      </ErrorBoundary>
    );

    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(onErrorCallback).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
      expect.stringMatching(/^error_\d+$/)
    );
  });

  it('resets error state when reset button is clicked', () => {
    // Create a custom fallback that tracks reset calls
    const mockReset = vi.fn();
    const CustomTestFallback: React.FC<{
      error: Error;
      errorInfo: React.ErrorInfo | null;
      resetError: () => void;
      errorId: string;
    }> = ({ error, resetError, errorId }) => {
      const handleReset = () => {
        mockReset();
        resetError();
      };
      
      return (
        <div data-testid="test-fallback">
          <p>Error: {error.message}</p>
          <p>Error ID: {errorId}</p>
          <button onClick={handleReset} data-testid="test-reset-button">Reset Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary fallback={CustomTestFallback}>
        <ThrowError shouldThrow={true} errorMessage="Reset test error" />
      </ErrorBoundary>
    );

    // Verify error state is shown
    expect(screen.getByTestId('test-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error: Reset test error')).toBeInTheDocument();
    
    // Click reset button
    const resetButton = screen.getByTestId('test-reset-button');
    fireEvent.click(resetButton);

    // Verify reset function was called
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('redirects to home when go home button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Home redirect test" />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go Home');
    fireEvent.click(goHomeButton);

    expect(window.location.href).toBe('/');
  });
});
