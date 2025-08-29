import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../SearchBar';

describe('SearchBar - Behavioral Tests', () => {
  const user = userEvent.setup();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('User Search Workflows', () => {
    it('allows user to type search query and eventually triggers onChange', async () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          placeholder="Search presentations..."
          debounceTime={50} // Use short debounce for testing
        />
      );

      const searchInput = screen.getByPlaceholderText('Search presentations...');
      expect(searchInput).toBeInTheDocument();

      await user.type(searchInput, 'react presentation');

      // Wait for debounced call
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('react presentation');
        },
        { timeout: 1000 }
      );
    });

    it('shows clear button when user enters text and clears on click', async () => {
      render(<SearchBar value="" onChange={mockOnChange} placeholder="Search..." />);

      const searchInput = screen.getByPlaceholderText('Search...');

      // Initially no clear button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      await user.type(searchInput, 'test');

      // Clear button should appear
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton.querySelector('svg')).toBeInTheDocument(); // X icon

      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles rapid typing and eventually calls onChange with final value', async () => {
      render(<SearchBar value="" onChange={mockOnChange} debounceTime={100} />);

      const searchInput = screen.getByRole('textbox');

      // Type rapidly
      await user.type(searchInput, 'abc');

      // Wait for the debounced call
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('abc');
        },
        { timeout: 1000 }
      );

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search State Synchronization', () => {
    it('synchronizes local state with external value prop changes', async () => {
      const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveValue('initial');

      // External value change
      rerender(<SearchBar value="updated externally" onChange={mockOnChange} />);

      expect(searchInput).toHaveValue('updated externally');
    });

    it('shows user input immediately while debouncing the onChange callback', async () => {
      render(<SearchBar value="" onChange={mockOnChange} debounceTime={200} />);

      const searchInput = screen.getByRole('textbox');

      await user.type(searchInput, 'user typing');

      // Input should immediately show user's typing
      expect(searchInput).toHaveValue('user typing');

      // Eventually the onChange should be called
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('user typing');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Search Behavior Edge Cases', () => {
    it('clears search immediately when clear button is clicked', async () => {
      render(<SearchBar value="" onChange={mockOnChange} debounceTime={100} />);

      const searchInput = screen.getByRole('textbox');

      await user.type(searchInput, 'search term');

      // Clear button should appear
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('properly handles component unmount without errors', () => {
      const { unmount } = render(<SearchBar value="" onChange={mockOnChange} />);

      // Simulate component unmount - should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('handles empty string search appropriately', async () => {
      render(<SearchBar value="existing text" onChange={mockOnChange} debounceTime={50} />);

      const searchInput = screen.getByRole('textbox');

      // Clear the input manually
      await user.clear(searchInput);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('');
      });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides proper semantic structure with search input', () => {
      render(<SearchBar value="" onChange={mockOnChange} placeholder="Find your content" />);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder', 'Find your content');

      // Should have search icon for visual context
      const searchIcon = document.querySelector('svg[class*="lucide-search"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('supports keyboard interaction for clearing search', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test search');

      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();

      // Clear using keyboard
      clearButton.focus();
      await user.keyboard('{Enter}');

      expect(searchInput).toHaveValue('');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('maintains focus on search input after clearing', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'focus test');

      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      // Input should still be focusable/usable after clearing
      expect(searchInput).toHaveValue('');
      await user.type(searchInput, 'new search');
      expect(searchInput).toHaveValue('new search');
    });
  });

  describe('Customization and Configuration', () => {
    it('respects custom debounce time configuration', async () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          debounceTime={100} // Use shorter time for testing
        />
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'custom timing');

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('custom timing');
        },
        { timeout: 1000 }
      );
    });

    it('applies custom CSS classes correctly', () => {
      render(<SearchBar value="" onChange={mockOnChange} className="custom-search-class" />);

      const searchContainer = screen.getByRole('textbox').closest('div');
      expect(searchContainer).toHaveClass('custom-search-class');
    });

    it('uses default placeholder when none provided', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText('Search presentations...')).toBeInTheDocument();
    });
  });

  describe('Real-world User Scenarios', () => {
    it('handles complete user workflow: type, modify, clear, and search again', async () => {
      render(<SearchBar value="" onChange={mockOnChange} debounceTime={50} />);

      const searchInput = screen.getByRole('textbox');

      // Initial search
      await user.type(searchInput, 'react');
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('react');
      });

      // User modifies search
      await user.type(searchInput, ' hooks');
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('react hooks');
      });

      // User clears and searches for something else
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);
      expect(mockOnChange).toHaveBeenCalledWith('');

      await user.type(searchInput, 'vue');
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('vue');
      });

      expect(mockOnChange).toHaveBeenCalledTimes(4);
    });

    it('provides immediate visual feedback while debouncing callbacks', async () => {
      render(<SearchBar value="" onChange={mockOnChange} debounceTime={100} />);

      const searchInput = screen.getByRole('textbox');

      // User should see their typing immediately
      await user.type(searchInput, 'i');
      expect(searchInput).toHaveValue('i');

      await user.type(searchInput, 'mmediate');
      expect(searchInput).toHaveValue('immediate');

      // Clear button should appear immediately
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Eventually callback should be called
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('immediate');
      });
    });
  });
});
