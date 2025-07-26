import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ReactErrorBoundary from '@/shared/components/common/ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
  const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
    consoleGroupSpy.mockClear();
    consoleGroupEndSpy.mockClear();
  });

  it('renders children when there is no error', () => {
    render(
      <ReactErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error fallback when there is an error', () => {
    render(
      <ReactErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We encountered an unexpected error. Our team has been notified.')
    ).toBeInTheDocument();
  });

  it('shows error details when showDetails is true', () => {
    render(
      <ReactErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    render(
      <ReactErrorBoundary showDetails={false}>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ReactErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object), expect.any(String));
  });

  it('logs error to console', () => {
    render(
      <ReactErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('Critical Error'));
    expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('resets error state when try again button is clicked', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Component recovered</div>;
    };

    const { rerender } = render(
      <ReactErrorBoundary>
        <DynamicComponent />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;

    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    rerender(
      <ReactErrorBoundary>
        <DynamicComponent />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('Component recovered')).toBeInTheDocument();
  });

  it('navigates to home when go home button is clicked', async () => {
    const user = userEvent.setup();

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <ReactErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go Home');
    await user.click(goHomeButton);

    expect(window.location.href).toBe('/');
  });

  it('generates unique error IDs', () => {
    const onError1 = vi.fn();
    const onError2 = vi.fn();

    const { unmount } = render(
      <ReactErrorBoundary onError={onError1}>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    unmount();

    render(
      <ReactErrorBoundary onError={onError2}>
        <ThrowError shouldThrow={true} />
      </ReactErrorBoundary>
    );

    const errorId1 = onError1.mock.calls[0][2];
    const errorId2 = onError2.mock.calls[0][2];

    expect(errorId1).not.toBe(errorId2);
    expect(typeof errorId1).toBe('string');
    expect(typeof errorId2).toBe('string');
  });
});
