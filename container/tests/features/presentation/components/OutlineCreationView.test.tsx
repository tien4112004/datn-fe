import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineCreationView from '@/features/presentation/components/OutlineCreationView';
import type { ModelOption } from '@/features/model';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Create Your Presentation',
        subtitle: 'Generate an outline in seconds',
        generateOutline: 'Generate Outline',
      };
      return translations[key] || key;
    },
  })),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/features/presentation/components/OutlineForm', () => ({
  default: vi.fn(
    ({ promptInput, setPromptInput, slideCount, setSlideCount, style, setStyle, model, setModel }: any) => (
      <div data-testid="outline-form">
        <input
          data-testid="prompt-input"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />
        <select
          data-testid="slide-count-select"
          value={slideCount}
          onChange={(e) => setSlideCount(e.target.value)}
        >
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <select
          data-testid="style-select"
          value={style || ''}
          onChange={(e) => setStyle(e.target.value || undefined)}
        >
          <option value="">Select Style</option>
          <option value="business">Business</option>
        </select>
        <select data-testid="model-select" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
        </select>
      </div>
    )
  ),
}));

describe('OutlineCreationView', () => {
  const mockDefaultModel: ModelOption = {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
  };

  const mockOnCreateOutline = vi.fn();

  const defaultProps = {
    defaultModel: mockDefaultModel,
    onCreateOutline: mockOnCreateOutline,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main elements correctly', () => {
    render(<OutlineCreationView {...defaultProps} />);

    expect(screen.getByText('Create Your Presentation')).toBeInTheDocument();
    expect(screen.getByText('Generate an outline in seconds')).toBeInTheDocument();
    expect(screen.getByTestId('outline-form')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Generate Outline')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const mainContainer = screen.getByText('Create Your Presentation').closest('div');
    expect(mainContainer).toHaveClass(
      'lg:w-4xl',
      'flex',
      'min-h-[calc(100vh-1rem)]',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-4',
      'self-center',
      'sm:w-full'
    );
  });

  it('displays title with correct styling', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const title = screen.getByText('Create Your Presentation');
    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'leading-10', 'text-neutral-900');
  });

  it('displays subtitle with correct styling', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const subtitle = screen.getByText('Generate an outline in seconds');
    expect(subtitle.tagName).toBe('H2');
    expect(subtitle).toHaveClass('text-xl', 'font-bold', 'leading-10', 'text-sky-500/80');
  });

  it('initializes form state with default values', () => {
    render(<OutlineCreationView {...defaultProps} />);

    expect(screen.getByTestId('prompt-input')).toHaveValue('');
    expect(screen.getByTestId('slide-count-select')).toHaveValue('10');
    expect(screen.getByTestId('style-select')).toHaveValue('');
    expect(screen.getByTestId('model-select')).toHaveValue('gpt-4o-mini');
  });

  it('updates prompt input when user types', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const promptInput = screen.getByTestId('prompt-input');
    fireEvent.change(promptInput, { target: { value: 'AI presentation' } });

    expect(promptInput).toHaveValue('AI presentation');
  });

  it('updates slide count when user selects', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const slideCountSelect = screen.getByTestId('slide-count-select');
    fireEvent.change(slideCountSelect, { target: { value: '20' } });

    expect(slideCountSelect).toHaveValue('20');
  });

  it('updates style when user selects', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const styleSelect = screen.getByTestId('style-select');
    fireEvent.change(styleSelect, { target: { value: 'business' } });

    expect(styleSelect).toHaveValue('business');
  });

  it('calls onCreateOutline with correct data when generate button is clicked', () => {
    render(<OutlineCreationView {...defaultProps} />);

    // Set some form values
    const promptInput = screen.getByTestId('prompt-input');
    const slideCountSelect = screen.getByTestId('slide-count-select');
    const styleSelect = screen.getByTestId('style-select');

    fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
    fireEvent.change(slideCountSelect, { target: { value: '20' } });
    fireEvent.change(styleSelect, { target: { value: 'business' } });

    const generateButton = screen.getByTestId('button');
    fireEvent.click(generateButton);

    expect(mockOnCreateOutline).toHaveBeenCalledWith({
      prompt: 'Test prompt',
      slideCount: '20',
      style: 'business',
      model: 'gpt-4o-mini',
    });
  });

  it('calls onCreateOutline with undefined style when none selected', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const promptInput = screen.getByTestId('prompt-input');
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

    const generateButton = screen.getByTestId('button');
    fireEvent.click(generateButton);

    expect(mockOnCreateOutline).toHaveBeenCalledWith({
      prompt: 'Test prompt',
      slideCount: '10',
      style: undefined,
      model: 'gpt-4o-mini',
    });
  });

  it('uses model name from defaultModel prop', () => {
    const customModel: ModelOption = {
      id: 'gemini-2.0-flash',
      name: 'gemini-2.0-flash',
      displayName: 'Gemini 2.0 Flash',
    };

    const defaultPropsWithCustomModel = {
      ...defaultProps,
      defaultModel: customModel,
    };

    render(<OutlineCreationView {...defaultPropsWithCustomModel} />);

    expect(screen.getByTestId('model-select')).toHaveValue('gemini-2.0-flash');
  });

  it('handles form state changes correctly', () => {
    render(<OutlineCreationView {...defaultProps} />);

    const promptInput = screen.getByTestId('prompt-input');
    const slideCountSelect = screen.getByTestId('slide-count-select');
    const modelSelect = screen.getByTestId('model-select');

    // Change multiple values
    fireEvent.change(promptInput, { target: { value: 'New prompt' } });
    fireEvent.change(slideCountSelect, { target: { value: '20' } });

    // Verify all changes persist
    expect(promptInput).toHaveValue('New prompt');
    expect(slideCountSelect).toHaveValue('20');
    expect(modelSelect).toHaveValue('gpt-4o-mini');
  });
});
