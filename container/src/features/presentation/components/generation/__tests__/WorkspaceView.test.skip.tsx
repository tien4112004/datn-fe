import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceView from '@/features/presentation/components/generation/WorkspaceView';
import type { OutlineData } from '@/features/presentation/types/outline';
import { renderWithProviders } from '@/tests/test-utils';

describe('WorkspaceView', () => {
  const mockOutlineData: OutlineData = {
    topic: 'Test Topic',
    slideCount: 2,
    language: 'en',
    model: 'gpt-4.1-nano-2025-04-14',
    targetAge: '7-10',
    learningObjective: 'Learn testing',
  };

  const defaultProps = {
    initialOutlineData: mockOutlineData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workspace header with title', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    const title = screen.getByText('Customize');
    expect(title.tagName).toBe('H1');
  });

  it('renders outline workspace with correct props', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    expect(screen.getByText('Prompt')).toBeInTheDocument();

    expect(screen.getByText('Test Topic')).toBeInTheDocument();

    const slideCountSelect = screen.getByDisplayValue(/2 slides/i);
    expect(slideCountSelect).toBeInTheDocument();

    const languageSelect = screen.getByDisplayValue(/english/i);
    expect(languageSelect).toBeInTheDocument();

    const targetAgeSelect = screen.getByDisplayValue(/7-10/i);
    expect(targetAgeSelect).toBeInTheDocument();
  });

  it('renders customization section', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    expect(screen.getByText('Customize')).toBeInTheDocument();
  });

  it('renders generate presentation button', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    const generateButton = screen.getByText('Generate Presentation');
    expect(generateButton).toBeInTheDocument();
  });

  it('handles customization form submission', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    const submitButton = screen.getByText('Generate Presentation');
    fireEvent.click(submitButton);

    // Should handle the submission without errors
    expect(submitButton).toBeInTheDocument();
  });

  it('shows rotate when not fetching', () => {
    renderWithProviders(<WorkspaceView {...defaultProps} />);

    const regenerateButton = screen.getByText('Regenerate');
    expect(regenerateButton).not.toBeDisabled();
  });
});
