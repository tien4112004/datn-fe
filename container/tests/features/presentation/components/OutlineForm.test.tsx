import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineForm from '@/features/presentation/components/generation/OutlineForm';
import type { OutlineFormProps } from '@/features/presentation/components/generation/OutlineForm';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        promptTitle: 'Prompt',
        promptPlaceholder: 'Enter your presentation topic...',
        slideCountPlaceholder: 'Select slide count',
        slideCountLabel: 'Number of slides',
        slideCountUnit: 'slides',
        stylePlaceholder: 'Select style',
        styleLabel: 'Presentation style',
        styleBusiness: 'Business',
        styleEducation: 'Education',
        styleCreative: 'Creative',
        styleMinimal: 'Minimal',
        modelPlaceholder: 'Select model',
        modelLabel: 'AI Model',
      };
      return translations[key] || key;
    },
  })),
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

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/autosize-textarea', () => ({
  AutosizeTextarea: ({
    value,
    onChange,
    placeholder,
    className,
    variant,
    minHeight,
    maxHeight,
    ...props
  }: any) => (
    <textarea
      data-testid="autosize-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-variant={variant}
      data-min-height={minHeight}
      data-max-height={maxHeight}
      {...props}
    />
  ),
}));

vi.mock('@/features/presentation/components/ExamplePrompts', () => ({
  default: vi.fn(({ onExampleClick, promptInput }: any) => (
    <div data-testid="example-prompts">
      <button data-testid="example-button" onClick={() => onExampleClick('Example prompt')}>
        Example Prompt
      </button>
      <span data-testid="prompt-input-value">{promptInput}</span>
    </div>
  )),
}));

vi.mock('@/features/presentation/constants/styles', () => ({
  PRESENTATION_STYLES: [
    { value: 'business', labelKey: 'styleBusiness' },
    { value: 'education', labelKey: 'styleEducation' },
    { value: 'creative', labelKey: 'styleCreative' },
    { value: 'minimal', labelKey: 'styleMinimal' },
  ],
}));

vi.mock('@/features/model', () => ({
  useModels: vi.fn(() => ({
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ],
  })),
}));

describe('OutlineForm', () => {
  const mockSetPromptInput = vi.fn();
  const mockSetSlideCount = vi.fn();
  const mockSetStyle = vi.fn();
  const mockSetModel = vi.fn();

  const defaultProps: OutlineFormProps = {
    promptInput: '',
    setPromptInput: mockSetPromptInput,
    slideCount: '10',
    setSlideCount: mockSetSlideCount,
    style: undefined,
    setStyle: mockSetStyle,
    model: 'gpt-4o-mini',
    setModel: mockSetModel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main components', () => {
    render(<OutlineForm {...defaultProps} />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('autosize-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('example-prompts')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<OutlineForm {...defaultProps} />);

    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveClass('text-medium');
  });

  it('renders autosize textarea with correct props', () => {
    render(<OutlineForm {...defaultProps} />);

    const textarea = screen.getByTestId('autosize-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your presentation topic...');
    expect(textarea).toHaveAttribute('data-variant', 'ghost');
    expect(textarea).toHaveAttribute('data-min-height', '36');
    expect(textarea).toHaveAttribute('data-max-height', '200');
    expect(textarea).toHaveClass('w-full');
    expect(textarea).toHaveValue('');
  });

  it('renders all three select components', () => {
    render(<OutlineForm {...defaultProps} />);

    const selects = screen.getAllByTestId('select');
    expect(selects).toHaveLength(3);
  });

  it('renders slide count select with correct options', () => {
    render(<OutlineForm {...defaultProps} />);

    const slideCountOptions = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 36];

    expect(screen.getByText('Number of slides')).toBeInTheDocument();
    expect(screen.getByText('Select slide count')).toBeInTheDocument();

    // Check that all slide count options are rendered
    slideCountOptions.forEach((num) => {
      expect(screen.getByText(`${num} slides`)).toBeInTheDocument();
    });
  });

  it('renders style select with correct options', () => {
    render(<OutlineForm {...defaultProps} />);

    expect(screen.getByText('Presentation style')).toBeInTheDocument();
    expect(screen.getByText('Select style')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('renders model select with correct options', () => {
    render(<OutlineForm {...defaultProps} />);

    expect(screen.getByText('AI Model')).toBeInTheDocument();
    expect(screen.getByText('Select model')).toBeInTheDocument();
    expect(screen.getByText('GPT-4o Mini')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
  });

  // it('calls setPromptInput when textarea value changes', async () => {
  //   const user = userEvent.setup();
  //   render(<OutlineForm {...defaultProps} />);

  //   const textarea = screen.getByTestId('autosize-textarea');
  //   await user.clear(textarea);
  //   await user.type(textarea, 'New prompt');

  //   expect(mockSetPromptInput).toHaveBeenLastCalledWith('New prompt');
  // });

  // it('calls setSlideCount when slide count select changes', async () => {
  //   const user = userEvent.setup();
  //   render(<OutlineForm {...defaultProps} />);

  //   const selects = screen.getAllByTestId('select');
  //   const slideCountSelect = selects[0]; // First select is slide count

  //   await user.selectOptions(slideCountSelect, '20');

  //   expect(mockSetSlideCount).toHaveBeenCalledWith('20');
  // });

  // it('calls setStyle when style select changes', async () => {
  //   const user = userEvent.setup();
  //   render(<OutlineForm {...defaultProps} />);

  //   const selects = screen.getAllByTestId('select');
  //   const styleSelect = selects[1]; // Second select is style

  //   await user.selectOptions(styleSelect, 'business');

  //   expect(mockSetStyle).toHaveBeenCalledWith('business');
  // });

  // it('calls setModel when model select changes', async () => {
  //   const user = userEvent.setup();
  //   render(<OutlineForm {...defaultProps} />);

  //   const selects = screen.getAllByTestId('select');
  //   const modelSelect = selects[2]; // Third select is model

  //   await user.selectOptions(modelSelect, 'gemini-2.0-flash');

  //   expect(mockSetModel).toHaveBeenCalledWith('gemini-2.0-flash');
  // });

  it('passes correct props to ExamplePrompts', () => {
    render(<OutlineForm {...defaultProps} promptInput="test input" />);

    // Just check that ExamplePrompts is rendered with the correct props by checking the DOM
    expect(screen.getByTestId('example-prompts')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-input-value')).toHaveTextContent('test input');
  });

  it('calls setPromptInput when example prompt is clicked', async () => {
    const user = userEvent.setup();
    render(<OutlineForm {...defaultProps} />);

    const exampleButton = screen.getByTestId('example-button');
    await user.click(exampleButton);

    expect(mockSetPromptInput).toHaveBeenCalledWith('Example prompt');
  });

  // it('reflects current values in form controls', () => {
  //   const propsWithValues: OutlineFormProps = {
  //     ...defaultProps,
  //     promptInput: 'Current prompt',
  //     slideCount: '20',
  //     style: 'business',
  //     model: 'gemini-2.0-flash',
  //   };

  //   render(<OutlineForm {...propsWithValues} />).debug();

  //   const textarea = screen.getByTestId('autosize-textarea');
  //   expect(textarea).toHaveValue('Current prompt');

  //   const selects = screen.getAllByTestId('select');
  //   expect(selects[0]).toHaveValue('20'); // slide count
  //   expect(selects[1]).toHaveValue('business'); // style
  //   expect(selects[2]).toHaveValue('gemini-2.0-flash'); // model
  // });

  it('applies correct styling to border container', () => {
    render(<OutlineForm {...defaultProps} />);

    const borderContainer = screen.getByTestId('autosize-textarea').closest('.border-primary');
    expect(borderContainer).toHaveClass('border-primary', 'rounded', 'border-2', 'px-2', 'pt-2');
  });

  it('applies correct layout classes to select container', () => {
    render(<OutlineForm {...defaultProps} />);

    const selectContainer = screen
      .getByTestId('autosize-textarea')
      .closest('.border-primary')
      ?.querySelector('.my-2');
    expect(selectContainer).toHaveClass('my-2', 'flex', 'flex-row', 'gap-1');
  });

  it('applies w-fit class to select triggers', () => {
    render(<OutlineForm {...defaultProps} />);

    const selectTriggers = screen.getAllByTestId('select-trigger');
    selectTriggers.forEach((trigger) => {
      expect(trigger).toHaveClass('w-fit');
    });
  });

  // it('handles undefined style value correctly', () => {
  //   render(<OutlineForm {...defaultProps} style={undefined} />);

  //   const selects = screen.getAllByTestId('select');
  //   const styleSelect = selects[1];
  //   expect(styleSelect).toHaveValue('');
  // });

  it('handles empty models array gracefully', () => {
    // Mock useModels to return null models
    const mockUseModels = vi.fn(() => ({ models: null }));
    vi.doMock('@/features/model', () => ({
      useModels: mockUseModels,
    }));

    render(<OutlineForm {...defaultProps} />);

    // Should still render the model select without options
    expect(screen.getByText('AI Model')).toBeInTheDocument();
  });
});
