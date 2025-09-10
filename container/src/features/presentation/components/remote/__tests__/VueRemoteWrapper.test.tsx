import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VueRemoteWrapper from '../VueRemoteWrapper';

// Create mock mount function using vi.hoisted to make it available in the mock factory
const mockMount = vi.hoisted(() => vi.fn());

vi.mock('../module', () => {
  return {
    moduleMap: {
      editor: vi.fn().mockResolvedValue({ mount: mockMount }),
      thumbnail: vi.fn().mockResolvedValue({ mount: mockMount }),
    },
  };
});

// Mock console to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('VueRemoteWrapper - Behavioral Tests', () => {
  // Test components
  const MockLoadingComponent = () => <div data-testid="loading">Loading Vue component...</div>;
  const MockErrorComponent = ({ error }: { error: Error }) => (
    <div data-testid="error">Error: {error.message}</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    mockMount.mockClear();
  });

  describe('Component Structure and Rendering', () => {
    it('renders container div with correct className', () => {
      render(
        <VueRemoteWrapper
          modulePath="editor"
          mountProps={{ test: 'data' }}
          className="test-container vue-remote"
        />
      );

      // The container div doesn't have a test-id in the real component
      const container = document.querySelector('.test-container.vue-remote');
      expect(container).toBeInTheDocument();
    });

    it('uses empty className when none provided', () => {
      render(<VueRemoteWrapper modulePath="editor" mountProps={{ test: 'data' }} />);

      // Check that there's a div without any class
      const container = document.querySelector('div[class=""]');
      expect(container).toBeInTheDocument();
    });

    it('renders container immediately regardless of loading state', () => {
      render(<VueRemoteWrapper modulePath="editor" mountProps={{ test: 'data' }} className="test-class" />);

      // Container should be present immediately
      const container = document.querySelector('.test-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Loading State Behavior', () => {
    it('shows loading component during module import', async () => {
      render(
        <VueRemoteWrapper
          modulePath="editor"
          mountProps={{ test: 'data' }}
          LoadingComponent={MockLoadingComponent}
        />
      );

      // Loading should be shown initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading Vue component...')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        },
        { timeout: 100 }
      );
    });

    it('does not show loading when LoadingComponent is not provided', () => {
      render(<VueRemoteWrapper modulePath="editor" mountProps={{ test: 'data' }} />);

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('hides loading after successful module load', async () => {
      render(
        <VueRemoteWrapper
          modulePath="editor"
          mountProps={{ test: 'data' }}
          LoadingComponent={MockLoadingComponent}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Module Loading', () => {
    it('calls mount function with correct parameters for editor', async () => {
      const mountProps = {
        titleTest: 'test',
        isRemote: true,
        presentation: { id: '1', title: 'Test Presentation' },
      };

      render(<VueRemoteWrapper modulePath="editor" mountProps={mountProps} />);

      await waitFor(() => {
        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockMount).toHaveBeenCalledWith(expect.any(Object), mountProps);
      });
    });

    it('calls mount function with correct parameters for thumbnail', async () => {
      const mountProps = {
        slide: { id: '1', elements: [] },
        size: 180,
        visible: true,
      };

      render(<VueRemoteWrapper modulePath="thumbnail" mountProps={mountProps} />);

      await waitFor(() => {
        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockMount).toHaveBeenCalledWith(expect.any(Object), mountProps);
      });
    });

    it('triggers onMountSuccess callback when module loads', async () => {
      const onMountSuccess = vi.fn();

      render(
        <VueRemoteWrapper modulePath="editor" mountProps={{ test: 'data' }} onMountSuccess={onMountSuccess} />
      );

      await waitFor(() => {
        expect(onMountSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error for unknown module path', async () => {
      render(
        <VueRemoteWrapper
          modulePath="unknown"
          mountProps={{ test: 'data' }}
          ErrorComponent={MockErrorComponent}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('Error: Unknown module path: unknown')).toBeInTheDocument();
      });
    });

    it('calls onMountError callback when error occurs', async () => {
      const onMountError = vi.fn();

      render(
        <VueRemoteWrapper modulePath="unknown" mountProps={{ test: 'data' }} onMountError={onMountError} />
      );

      await waitFor(() => {
        expect(onMountError).toHaveBeenCalledTimes(1);
        expect(onMountError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Unknown module path: unknown',
          })
        );
      });
    });

    it('does not show error component when none provided', async () => {
      render(<VueRemoteWrapper modulePath="unknown" mountProps={{ test: 'data' }} />);

      await waitFor(() => {
        expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      });
    });
  });
});
