import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceView from '@/features/presentation/components/generation/WorkspaceView';
import { renderWithProviders } from '@/tests/test-utils';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';

// Mock the hooks and dependencies
vi.mock('@/features/presentation/hooks/useWorkspace', () => ({
  useWorkspace: () => ({
    stopStream: vi.fn(),
    clearContent: vi.fn(),
    handleRegenerateOutline: vi.fn(),
    handleGeneratePresentation: vi.fn(),
    isGenerating: false,
  }),
}));

vi.mock('@/features/presentation/stores/useOutlineStore', () => ({
  default: vi.fn((selector) => {
    const state = {
      isStreaming: false,
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

vi.mock('@/features/model', () => ({
  useModels: () => ({
    models: [
      { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
  }),
}));

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
  CustomizationSection: ({ onGeneratePresentation, isGenerating, disabled }: any) => (
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workspace header with title', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    const title = screen.getByText('Customize');
    expect(title.tagName).toBe('H1');
  });

  it('renders prompt section with correct elements', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('topic-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('loading-button')).toBeInTheDocument(); // Regenerate button
  });

  it('renders outline section', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Outline')).toBeInTheDocument();
    expect(screen.getByTestId('outline-workspace')).toBeInTheDocument();
  });

  it('renders customization section', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    expect(screen.getByTestId('customization-section')).toBeInTheDocument();
  });

  it('renders generate presentation button', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    const generateButton = screen.getByText('Generate Presentation');
    expect(generateButton).toBeInTheDocument();
  });

  it('handles form interactions without errors', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
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
        <WorkspaceView />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Total slides: 10')).toBeInTheDocument(); // Default slideCount is 10
  });

  it('shows development buttons when not streaming', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <WorkspaceView />
      </PresentationFormProvider>
    );

    expect(screen.getByText('Clear (Dev)')).toBeInTheDocument();
  });
});
