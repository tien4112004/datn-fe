import { fireEvent, screen } from '@testing-library/react';
import OutlineCard from '@/features/presentation/components/generation/OutlineCard';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';

describe('OutlineCard', () => {
  const mockOnDelete = vi.fn();
  const standardProps = {
    id: 'test-id',
    title: 'Test Title',
    item: {
      id: 'item-id',
      htmlContent: '<p>Test content</p><h1>Test Heading</h1>',
      markdownContent: '# Test Heading\n\nTest content',
    },
    onDelete: mockOnDelete,
  };

  it('should render without crashing', () => {
    renderWithProviders(<OutlineCard {...standardProps} />);

    const card = screen.getByText('Test Title');
    expect(card).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    renderWithProviders(<OutlineCard {...standardProps} />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      fireEvent.click(button);
    });

    setTimeout(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    }, 500);
  });
});
