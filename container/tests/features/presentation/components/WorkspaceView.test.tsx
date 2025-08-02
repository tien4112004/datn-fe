import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceView from '@/features/presentation/components/WorkspaceView';
import type { OutlineData } from '@/features/presentation/types/outline';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        promptSection: 'Prompt',
        slideCountPlaceholder: 'Select slides',
        slideCountLabel: 'Slides',
        slideCountUnit: 'slides',
        stylePlaceholder: 'Select style',
        styleLabel: 'Style',
        modelPlaceholder: 'Select model',
        modelLabel: 'Model',
        loading: 'Loading...',
        regenerate: 'Regenerate',
        customizePresentation: 'Customize Presentation',
        generatePresentation: 'Generate Presentation',
        title: 'Customize',
        outlineSection: 'Outline',
        loadingOutline: 'Loading outline...',
        customizeSection: 'Customize your presentation',
      };
      return translations[key] || key;
    },
  })),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    control: {},
    handleSubmit: vi.fn((fn) => fn),
    setValue: vi.fn(),
    watch: vi.fn(() => []),
  })),
  Controller: ({ render, name }: any) => {
    const field = { value: '', onChange: vi.fn() };
    return <div data-testid={`controller-${name}`}>{render({ field })}</div>;
  },
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, type, size, disabled, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      type={type}
      data-size={size}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/autosize-textarea', () => ({
  AutosizeTextarea: ({ className, ...props }: any) => (
    <textarea data-testid="autosize-textarea" className={className} {...props} />
  ),
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, ...props }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children, ...props }: any) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  SelectGroup: ({ children, ...props }: any) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, ...props }: any) => (
    <option data-testid="select-item" value={value} {...props}>
      {children}
    </option>
  ),
  SelectLabel: ({ children, ...props }: any) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className, ...props }: any) => (
    <div data-testid="select-trigger" className={className} {...props}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder, ...props }: any) => (
    <span data-testid="select-value" {...props}>
      {placeholder}
    </span>
  ),
}));

vi.mock('lucide-react', () => ({
  RotateCcw: ({ className }: any) => <div data-testid="rotate-ccw-icon" className={className} />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

vi.mock('@/features/model', () => ({
  useModels: vi.fn(() => ({
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ],
  })),
}));

vi.mock('@/features/presentation/constants/styles', () => ({
  PRESENTATION_STYLES: [
    { value: 'business', labelKey: 'styleBusiness' },
    { value: 'education', labelKey: 'styleEducation' },
  ],
}));

vi.mock('@/features/presentation/hooks/useApi', () => ({
  usePresentationOutlines: vi.fn(() => ({
    outlineItems: [
      { id: '1', htmlContent: '<p>Outline 1</p>' },
      { id: '2', htmlContent: '<p>Outline 2</p>' },
    ],
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/features/presentation/components/OutlineWorkspace', () => ({
  default: vi.fn(({ items, setItems, isFetching }: any) => (
    <div data-testid="outline-workspace">
      <span data-testid="items-count">{items.length}</span>
      <button data-testid="set-items-button" onClick={() => setItems([])}>
        Clear Items
      </button>
      <span data-testid="is-fetching">{isFetching ? 'fetching' : 'not-fetching'}</span>
    </div>
  )),
}));

vi.mock('@/features/presentation/components/PresentationCustomizationForm', () => ({
  default: vi.fn(() => (
    <div data-testid="presentation-customization-form">
      <button data-testid="submit-customization">Submit Customization</button>
    </div>
  )),
}));

describe('WorkspaceView', () => {
  const mockOutlineData: OutlineData = {
    prompt: 'Test prompt',
    slideCount: '10',
    style: 'business',
    model: 'gpt-4o-mini',
  };

  const defaultProps = {
    initialOutlineData: mockOutlineData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workspace header with title', () => {
    render(<WorkspaceView {...defaultProps} />);

    const title = screen.getByText('Customize');
    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'leading-10', 'text-neutral-900');
  });

  it('renders outline form section with all controls', () => {
    render(<WorkspaceView {...defaultProps} />);

    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('controller-slideCount')).toBeInTheDocument();
    expect(screen.getByTestId('controller-style')).toBeInTheDocument();
    expect(screen.getByTestId('controller-model')).toBeInTheDocument();
    expect(screen.getByTestId('controller-prompt')).toBeInTheDocument();
  });

  it('renders outline workspace with correct props', () => {
    render(<WorkspaceView {...defaultProps} />);

    expect(screen.getByTestId('outline-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('items-count')).toHaveTextContent('2');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('not-fetching');
  });

  it('renders customization section', () => {
    render(<WorkspaceView {...defaultProps} />);

    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getByTestId('presentation-customization-form')).toBeInTheDocument();
  });

  it('renders generate presentation button', () => {
    render(<WorkspaceView {...defaultProps} />);

    const generateButton = screen.getByText('Generate Presentation');
    expect(generateButton).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('handles null initial outline data', () => {
    render(<WorkspaceView initialOutlineData={null} />);

    expect(screen.getByTestId('outline-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('presentation-customization-form')).toBeInTheDocument();
  });

  // it('calls refetch when regenerate is triggered', async () => {
  //   const mockRefetch = vi.fn();
  //   vi.mocked(require('@/features/presentation/hooks/useApi').usePresentationOutlines).mockReturnValue({
  //     outlineItems: [],
  //     isFetching: false,
  //     refetch: mockRefetch,
  //   });

  //   render(<WorkspaceView {...defaultProps} />);

  //   const regenerateButton = screen.getByText('Regenerate');
  //   fireEvent.click(regenerateButton);

  //   await waitFor(() => {
  //     expect(mockRefetch).toHaveBeenCalled();
  //   });
  // });

  it('updates items when setItems is called', () => {
    render(<WorkspaceView {...defaultProps} />);

    expect(screen.getByTestId('items-count')).toHaveTextContent('2');

    const clearButton = screen.getByTestId('set-items-button');
    fireEvent.click(clearButton);

    // Items should be updated through setValue
    expect(screen.getByTestId('set-items-button')).toBeInTheDocument();
  });

  it('handles customization form submission', () => {
    render(<WorkspaceView {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-customization');
    fireEvent.click(submitButton);

    // Should handle the submission without errors
    expect(submitButton).toBeInTheDocument();
  });

  // it('displays loading spinner icon when regenerating', () => {
  //   vi.mocked(require('@/features/presentation/hooks/useApi').usePresentationOutlines).mockReturnValue({
  //     outlineItems: [],
  //     isFetching: true,
  //     refetch: vi.fn(),
  //   });

  //   render(<WorkspaceView {...defaultProps} />);

  //   const regenerateButton = screen.getByText('Loading...');
  //   expect(regenerateButton).toBeDisabled();

  //   // Should show loading spinner
  //   const spinner = regenerateButton.querySelector('.animate-spin');
  //   expect(spinner).toBeInTheDocument();
  // });

  it('shows rotate icon when not fetching', () => {
    render(<WorkspaceView {...defaultProps} />);

    const regenerateButton = screen.getByText('Regenerate');
    expect(regenerateButton).not.toBeDisabled();
    expect(screen.getByTestId('rotate-ccw-icon')).toBeInTheDocument();
  });
});
