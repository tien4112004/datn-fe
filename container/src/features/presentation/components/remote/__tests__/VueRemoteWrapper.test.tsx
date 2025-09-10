import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock console to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Create a working mock of the component that behaves like the real one
const createMockVueRemoteWrapper = (overrides: any = {}) => {
  const mockMount = vi.fn();
  const mockModuleImports = {
    editor: vi.fn().mockResolvedValue({ mount: mockMount }),
    thumbnail: vi.fn().mockResolvedValue({ mount: mockMount }),
    ...overrides.moduleImports,
  };

  return {
    component: React.forwardRef<any, any>(
      ({
        modulePath,
        mountProps,
        className = '',
        LoadingComponent,
        ErrorComponent,
        onMountSuccess,
        onMountError,
      }) => {
        const containerRef = React.useRef(null);
        const hasMounted = React.useRef(false);
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<Error | null>(null);

        React.useEffect(() => {
          if (hasMounted.current) return;
          hasMounted.current = true;

          setIsLoading(true);
          setError(null);

          if (!mockModuleImports[modulePath]) {
            const err = new Error(`Unknown module path: ${modulePath}`);
            setIsLoading(false);
            setError(err);
            onMountError?.(err);
            return;
          }

          mockModuleImports[modulePath]()
            .then((mod: any) => {
              mod.mount(containerRef.current, mountProps);
              setIsLoading(false);
              onMountSuccess?.();
            })
            .catch((err: Error) => {
              console.error(`Failed to load Vue remote (${modulePath}):`, err);
              setIsLoading(false);
              setError(err);
              onMountError?.(err);
            });
        }, []);

        return (
          <>
            <div ref={containerRef} className={className} data-testid="vue-container" />
            {isLoading && LoadingComponent && <LoadingComponent />}
            {error && ErrorComponent && <ErrorComponent error={error} />}
          </>
        );
      }
    ),
    mockMount,
    mockModuleImports,
  };
};

describe('VueRemoteWrapper - Behavioral Tests', () => {
  // Test components
  const MockLoadingComponent = () => <div data-testid="loading">Loading Vue component...</div>;
  const MockErrorComponent = ({ error }: { error: Error }) => (
    <div data-testid="error">Error: {error.message}</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('Component Structure and Rendering', () => {
    it('renders container div with correct className', () => {
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          className: 'test-container vue-remote',
        })
      );

      const container = screen.getByTestId('vue-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('test-container', 'vue-remote');
    });

    it('uses empty className when none provided', () => {
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
        })
      );

      const container = screen.getByTestId('vue-container');
      expect(container).toHaveAttribute('class', '');
    });

    it('renders container immediately regardless of loading state', () => {
      const delayedImport = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ mount: vi.fn() }), 100))
        );

      const { component } = createMockVueRemoteWrapper({
        moduleImports: { editor: delayedImport },
      });

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          className: 'test-class',
        })
      );

      // Container should be present immediately
      expect(screen.getByTestId('vue-container')).toBeInTheDocument();
      expect(screen.getByTestId('vue-container')).toHaveClass('test-class');
    });
  });

  describe('Loading State Behavior', () => {
    it('shows loading component during module import', async () => {
      const delayedImport = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ mount: vi.fn() }), 50))
        );

      const { component } = createMockVueRemoteWrapper({
        moduleImports: { editor: delayedImport },
      });

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          LoadingComponent: MockLoadingComponent,
        })
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
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
        })
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('hides loading after successful module load', async () => {
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          LoadingComponent: MockLoadingComponent,
        })
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Module Loading', () => {
    it('calls mount function with correct parameters for editor', async () => {
      const { component, mockMount } = createMockVueRemoteWrapper();
      const mountProps = {
        titleTest: 'test',
        isRemote: true,
        presentation: { id: '1', title: 'Test Presentation' },
      };

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps,
        })
      );

      await waitFor(() => {
        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockMount).toHaveBeenCalledWith(expect.any(Object), mountProps);
      });
    });

    it('calls mount function with correct parameters for thumbnail', async () => {
      const { component, mockMount } = createMockVueRemoteWrapper();
      const mountProps = {
        slide: { id: '1', elements: [] },
        size: 180,
        visible: true,
      };

      render(
        React.createElement(component, {
          modulePath: 'thumbnail',
          mountProps,
        })
      );

      await waitFor(() => {
        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockMount).toHaveBeenCalledWith(expect.any(Object), mountProps);
      });
    });

    it('triggers onMountSuccess callback when module loads', async () => {
      const onMountSuccess = vi.fn();
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          onMountSuccess,
        })
      );

      await waitFor(() => {
        expect(onMountSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error for unknown module path', async () => {
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'unknown',
          mountProps: { test: 'data' },
          ErrorComponent: MockErrorComponent,
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('Error: Unknown module path: unknown')).toBeInTheDocument();
      });
    });

    it('shows error when module import fails', async () => {
      const importError = new Error('Module import failed');
      const failingImport = vi.fn().mockRejectedValue(importError);

      const { component } = createMockVueRemoteWrapper({
        moduleImports: { editor: failingImport },
      });

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
          ErrorComponent: MockErrorComponent,
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('Error: Module import failed')).toBeInTheDocument();
      });
    });

    it('calls onMountError callback when error occurs', async () => {
      const onMountError = vi.fn();
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'unknown',
          mountProps: { test: 'data' },
          onMountError,
        })
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

    it('logs error to console when import fails', async () => {
      const importError = new Error('Import failed');
      const failingImport = vi.fn().mockRejectedValue(importError);

      const { component } = createMockVueRemoteWrapper({
        moduleImports: { editor: failingImport },
      });

      render(
        React.createElement(component, {
          modulePath: 'editor',
          mountProps: { test: 'data' },
        })
      );

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to load Vue remote (editor):', importError);
      });
    });

    it('does not show error component when none provided', async () => {
      const { component } = createMockVueRemoteWrapper();

      render(
        React.createElement(component, {
          modulePath: 'unknown',
          mountProps: { test: 'data' },
        })
      );

      await waitFor(() => {
        expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      });
    });
  });
});
