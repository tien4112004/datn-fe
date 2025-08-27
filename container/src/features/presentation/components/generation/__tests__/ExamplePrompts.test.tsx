import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExamplePrompts from '@/features/presentation/components/generation/ExamplePrompts';
import { renderWithProviders } from '@/tests/test-utils';

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
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('renders all 6 example prompt buttons', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('calls onExampleClick when a prompt button is clicked', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByRole('button');

    const firstButton = buttons[Math.floor(Math.random() * buttons.length)];
    fireEvent.click(firstButton);

    expect(mockOnExampleClick).toHaveBeenCalledTimes(1);
  });

  it('does not render when promptInput is not empty', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} promptInput="User input" />);

    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();
  });

  it('shows prompts when promptInput has only whitespace', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} promptInput="   " />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('shows prompts when promptInput becomes empty after having content', () => {
    const { rerender } = renderWithProviders(<ExamplePrompts {...defaultProps} promptInput="Some content" />);

    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();

    rerender(<ExamplePrompts {...defaultProps} promptInput="" />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });
});
