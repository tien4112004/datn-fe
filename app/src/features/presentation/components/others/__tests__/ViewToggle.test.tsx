// import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import ViewToggle, { type ViewMode } from '../ViewToggle';

describe('ViewToggle', () => {
  const setup = (value: ViewMode = 'list', onValueChange = vi.fn()) => {
    render(<ViewToggle value={value} onValueChange={onValueChange} />);
    return { onValueChange };
  };

  it('renders both toggle options', () => {
    setup();
    expect(screen.getByLabelText(/list view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/grid view/i)).toBeInTheDocument();
  });

  it('calls onValueChange when a different toggle is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup('list', onValueChange);
    const gridToggle = screen.getByLabelText(/grid view/i);
    await user.click(gridToggle);
    expect(onValueChange).toHaveBeenCalledWith('grid');
  });

  it('does not call onValueChange when clicking the already-selected toggle', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup('list', onValueChange);
    const listToggle = screen.getByLabelText(/list view/i);
    await user.click(listToggle);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('has correct accessibility labels', () => {
    setup();
    expect(screen.getByLabelText('List view')).toBeInTheDocument();
    expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
  });
});
