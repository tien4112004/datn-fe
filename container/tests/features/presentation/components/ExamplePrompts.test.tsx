import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExamplePrompts from '@/features/presentation/components/ExamplePrompts';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        examplePromptTitle: 'Example Prompts',
        examplePrompt1: 'Create a presentation about AI',
        examplePrompt2: 'Explain blockchain technology',
        examplePrompt3: 'Present climate change solutions',
        examplePrompt4: 'Discuss remote work benefits',
        examplePrompt5: 'Explore quantum computing',
        examplePrompt6: 'Analyze market trends',
      };
      return translations[key] || key;
    },
  })),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('@/shared/components/ui/card', () => ({
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button data-testid="button" onClick={onClick} data-variant={variant} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('ExamplePrompts', () => {
  const mockOnExampleClick = vi.fn();
  const defaultProps = {
    onExampleClick: mockOnExampleClick,
    promptInput: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders example prompts when promptInput is empty', () => {
    render(<ExamplePrompts {...defaultProps} />);

    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('renders all 6 example prompt buttons', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(6);

    expect(screen.getByText('Create a presentation about AI')).toBeInTheDocument();
    expect(screen.getByText('Explain blockchain technology')).toBeInTheDocument();
    expect(screen.getByText('Present climate change solutions')).toBeInTheDocument();
    expect(screen.getByText('Discuss remote work benefits')).toBeInTheDocument();
    expect(screen.getByText('Explore quantum computing')).toBeInTheDocument();
    expect(screen.getByText('Analyze market trends')).toBeInTheDocument();
  });

  it('applies correct props to buttons', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByTestId('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('data-variant', 'prompt');
      expect(button).toHaveClass('h-auto', 'w-full', 'whitespace-normal', 'px-4', 'py-2', 'text-left');
    });
  });

  it('calls onExampleClick when a prompt button is clicked', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const firstButton = screen.getByText('Create a presentation about AI');
    fireEvent.click(firstButton);

    expect(mockOnExampleClick).toHaveBeenCalledWith('Create a presentation about AI');
    expect(mockOnExampleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onExampleClick with correct text for each button', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const prompts = [
      'Create a presentation about AI',
      'Explain blockchain technology',
      'Present climate change solutions',
      'Discuss remote work benefits',
      'Explore quantum computing',
      'Analyze market trends',
    ];

    prompts.forEach((prompt, index) => {
      const button = screen.getByText(prompt);
      fireEvent.click(button);
      expect(mockOnExampleClick).toHaveBeenNthCalledWith(index + 1, prompt);
    });

    expect(mockOnExampleClick).toHaveBeenCalledTimes(6);
  });

  it('does not render when promptInput is not empty', () => {
    render(<ExamplePrompts {...defaultProps} promptInput="User input" />);

    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
    expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();
  });

  it('shows prompts when promptInput has only whitespace', () => {
    render(<ExamplePrompts {...defaultProps} promptInput="   " />);

    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('shows prompts when promptInput becomes empty after having content', () => {
    const { rerender } = render(<ExamplePrompts {...defaultProps} promptInput="Some content" />);

    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();

    rerender(<ExamplePrompts {...defaultProps} promptInput="" />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('renders correct grid layout with 3 columns', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const gridContainer = screen.getByTestId('motion-div').querySelector('.grid-cols-3');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'gap-2');
  });

  it('renders buttons with paragraph tags containing prompt text', () => {
    render(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByTestId('button');
    buttons.forEach((button) => {
      const paragraph = button.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass('text-sm');
    });
  });
});
