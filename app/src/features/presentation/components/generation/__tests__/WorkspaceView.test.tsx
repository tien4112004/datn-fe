import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceView from '@/features/presentation/components/generation/WorkspaceView';
import { renderWithProviders } from '@/tests/test-utils';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';

// Mock the hooks and dependencies
vi.mock('@/features/presentation/hooks/useWorkspace', () => ({
  useWorkspace: () => ({
    stopStream: vi.fn(),
    clearContent: vi.fn(),
    handleRegenerateOutline: vi.fn(),
    handleGeneratePresentation: vi.fn(),
    isGenerating: false,
    isStreaming: false,
    control: {},
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(() => ({ topic: '' })),
  }),
}));

vi.mock('@/features/presentation/hooks/useGeneratingBlocker', () => ({
  useGeneratingBlocker: () => ({
    showDialog: false,
    setShowDialog: vi.fn(),
    handleStay: vi.fn(),
    handleProceed: vi.fn(),
    isProceeding: false,
  }),
}));

vi.mock('@/features/presentation/stores/useOutlineStore', () => {
  const mockUseOutlineStore = vi.fn((selector) => {
    const state = {
      outlines: [],
      outlineIds: [],
      isStreaming: false,
      markdownContent: () => '',
      setOutlines: vi.fn(),
      startStreaming: vi.fn(),
      endStreaming: vi.fn(),
      handleOutlineChange: vi.fn(),
      deleteOutline: vi.fn(),
      addOutline: vi.fn(),
      getOutline: vi.fn(),
      swap: vi.fn(),
      clearOutline: vi.fn(),
      isEmpty: () => false,
    };
    return typeof selector === 'function' ? selector(state) : state;
  });
  return {
    default: mockUseOutlineStore,
  };
});

vi.mock('@/features/model', async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...(originalModule as any),
    useModels: () => ({
      models: [
        { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ],
    }),
  };
});

// Mock the child components
vi.mock('@/features/presentation/components/generation/OutlineWorkspace', () => ({
  default: ({ onDownload, totalSlide }: any) => (
    <div data-testid="outline-workspace">
      <div>Total slides: {totalSlide}</div>
      <button onClick={onDownload}>Download</button>
    </div>
  ),
}));

vi.mock('@/features/presentation/components/generation/PresentationCustomizationForm', () => ({
  default: ({ onGeneratePresentation, isGenerating, disabled }: any) => (
    <div data-testid="customization-section">
      <button onClick={onGeneratePresentation} disabled={disabled || isGenerating}>
        Generate Presentation
      </button>
    </div>
  ),
}));

vi.mock('@/components/common/ModelSelect', () => ({
  ModelSelect: ({ models, value, onValueChange, placeholder, disabled }: any) => (
    <select
      data-testid="model-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {models?.map((model: any) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/shared/components/ui/autosize-textarea', () => ({
  AutosizeTextarea: ({ className, value, onChange, disabled, ...props }: any) => (
    <textarea
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="topic-textarea"
      {...props}
    />
  ),
}));

vi.mock('@/components/common/LoadingButton', () => ({
  default: ({ children, onClick, disabled, loading, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      data-testid="loading-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('WorkspaceView', () => {
  const mockOnWorkspaceEmpty = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnWorkspaceEmpty.mockClear();
  });

  it('renders workspace header with title', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    const title = screen.getByText('Customize');
    expect(title.tagName).toBe('H1');
  });

  it('renders prompt section with correct elements', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('topic-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('loading-button')).toBeInTheDocument(); // Regenerate button
  });

  it('renders outline section', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Outline')).toBeInTheDocument();
    expect(screen.getByTestId('outline-workspace')).toBeInTheDocument();
  });

  it('renders customization section', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(screen.getByTestId('customization-section')).toBeInTheDocument();
  });

  it('renders generate presentation button', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    const generateButton = screen.getByText('Generate Presentation');
    expect(generateButton).toBeInTheDocument();
  });

  it('handles form interactions without errors', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    // Should handle form without errors
    expect(screen.getByTestId('topic-textarea')).toBeInTheDocument();
  });

  it('shows outline workspace with correct slide count', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Total slides: 10')).toBeInTheDocument(); // Default slideCount is 10
  });

  it('shows development buttons when not streaming', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Clear (Dev)')).toBeInTheDocument();
  });

  it('calls onWorkspaceEmpty when outline and topic is empty and is not generating', () => {
    // Mock the store to return true for isEmpty
    const mockIsEmpty = vi.fn(() => true);
    vi.mocked(useOutlineStore).mockImplementation((selector: any) => {
      const state = {
        outlines: [],
        outlineIds: [],
        isStreaming: false,
        isGenerating: false,
        markdownContent: () => '',
        setOutlines: vi.fn(),
        startStreaming: vi.fn(),
        endStreaming: vi.fn(),
        handleOutlineChange: vi.fn(),
        deleteOutline: vi.fn(),
        addOutline: vi.fn(),
        getOutline: vi.fn(),
        swap: vi.fn(),
        clearOutline: vi.fn(),
        isEmpty: mockIsEmpty,
      };

      return typeof selector === 'function' ? selector(state) : state;
    });

    // Mock useWorkspace to return empty topic
    vi.doMock('@/features/presentation/hooks/useWorkspace', () => ({
      useWorkspace: () => ({
        stopStream: vi.fn(),
        clearContent: vi.fn(),
        handleRegenerateOutline: vi.fn(),
        handleGeneratePresentation: vi.fn(),
        isGenerating: false,
        isStreaming: false,
        control: {},
        watch: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(() => ({ topic: '' })),
      }),
    }));

    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(mockOnWorkspaceEmpty).toHaveBeenCalled();
  });

  it('does not call onWorkspaceEmpty when outline is not empty', () => {
    // Mock the store to return false for isEmpty
    const mockIsEmpty = vi.fn(() => false);
    vi.mocked(useOutlineStore).mockImplementation((selector: any) => {
      const state = {
        outlines: [],
        outlineIds: [],
        isStreaming: false,
        isGenerating: false,
        markdownContent: () => '',
        setOutlines: vi.fn(),
        startStreaming: vi.fn(),
        endStreaming: vi.fn(),
        handleOutlineChange: vi.fn(),
        deleteOutline: vi.fn(),
        addOutline: vi.fn(),
        getOutline: vi.fn(),
        swap: vi.fn(),
        clearOutline: vi.fn(),
        isEmpty: mockIsEmpty,
      };

      return typeof selector === 'function' ? selector(state) : state;
    });

    // Mock useWorkspace to return non-empty topic
    vi.doMock('@/features/presentation/hooks/useWorkspace', () => ({
      useWorkspace: () => ({
        stopStream: vi.fn(),
        clearContent: vi.fn(),
        handleRegenerateOutline: vi.fn(),
        handleGeneratePresentation: vi.fn(),
        isGenerating: false,
        isStreaming: false,
        control: {},
        watch: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(() => ({ topic: 'some topic' })),
      }),
    }));

    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView onWorkspaceEmpty={mockOnWorkspaceEmpty} />
      </PresentationFormProvider>
    );

    expect(mockOnWorkspaceEmpty).not.toHaveBeenCalled();
  });
});
