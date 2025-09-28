import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import { renderWithProviders } from '@/tests/test-utils';

describe('ExamplePrompts', () => {
  const mockOnExampleClick = vi.fn();
  const mockPrompts = [
    'Create a modern website design',
    'Design a mobile app interface',
    'Build a dashboard layout',
    'Create a landing page',
    'Design an e-commerce site',
    'Build a portfolio website',
  ];

  const defaultProps = {
    onExampleClick: mockOnExampleClick,
    isShown: true,
    prompts: mockPrompts,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders example prompts when isShown is true', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    const customTitle = 'Custom Example Prompts';
    renderWithProviders(<ExamplePrompts {...defaultProps} title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();
  });

  it('renders all provided prompt buttons', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(mockPrompts.length);

    mockPrompts.forEach((prompt) => {
      expect(screen.getByText(prompt)).toBeInTheDocument();
    });
  });

  it('calls onExampleClick when a prompt button is clicked', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    const firstButton = screen.getByText(mockPrompts[0]);
    fireEvent.click(firstButton);

    expect(mockOnExampleClick).toHaveBeenCalledTimes(1);
    expect(mockOnExampleClick).toHaveBeenCalledWith(mockPrompts[0]);
  });

  it('calls onExampleClick with correct prompt text for each button', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} />);

    mockPrompts.forEach((prompt) => {
      const button = screen.getByText(prompt);
      fireEvent.click(button);

      expect(mockOnExampleClick).toHaveBeenCalledWith(prompt);
    });

    expect(mockOnExampleClick).toHaveBeenCalledTimes(mockPrompts.length);
  });

  it('does not render when isShown is false', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} isShown={false} />);

    expect(screen.queryByText('Example Prompts')).not.toBeInTheDocument();
    mockPrompts.forEach((prompt) => {
      expect(screen.queryByText(prompt)).not.toBeInTheDocument();
    });
  });

  it('handles empty prompts array', () => {
    renderWithProviders(<ExamplePrompts {...defaultProps} prompts={[]} />);

    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
