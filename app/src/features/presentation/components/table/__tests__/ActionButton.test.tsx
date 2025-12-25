import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionButton, { ActionContent } from '@/features/presentation/components/table/ActionButton';
import { renderWithProviders } from '@/tests/test-utils';

describe('ActionButton', () => {
  const mockOnViewDetail = vi.fn();
  const mockOnRename = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ActionButton popover behavior', () => {
    it('displays ellipsis icon initially', () => {
      renderWithProviders(<ActionButton onRename={mockOnRename} onDelete={mockOnDelete} />);

      // Check that the trigger icon is visible (it's an SVG with specific class)
      const ellipsisIcon = document.querySelector('.lucide-ellipsis-vertical');
      expect(ellipsisIcon).toBeInTheDocument();
    });

    it('opens popover menu when clicked', async () => {
      renderWithProviders(
        <ActionButton onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      // Click the ellipsis icon to open popover
      const triggerButton = document.querySelector('.lucide-ellipsis-vertical');
      fireEvent.click(triggerButton!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rename/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('calls rename callback when rename option is selected', async () => {
      renderWithProviders(<ActionButton onRename={mockOnRename} onDelete={mockOnDelete} />);

      // Open popover and click rename
      const triggerButton = document.querySelector('.lucide-ellipsis-vertical');
      fireEvent.click(triggerButton!);

      await waitFor(async () => {
        const renameButton = screen.getByRole('button', { name: /rename/i });
        fireEvent.click(renameButton);
      });

      expect(mockOnRename).toHaveBeenCalledTimes(1);
    });

    it('calls delete callback when delete option is selected', async () => {
      renderWithProviders(<ActionButton onRename={mockOnRename} onDelete={mockOnDelete} />);

      // Open popover and click delete
      const triggerButton = document.querySelector('.lucide-ellipsis-vertical');
      fireEvent.click(triggerButton!);

      await waitFor(async () => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);
      });

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('handles missing callbacks gracefully', async () => {
      renderWithProviders(<ActionButton />);

      const triggerButton = document.querySelector('.lucide-ellipsis-vertical');
      fireEvent.click(triggerButton!);

      await waitFor(() => {
        const renameButton = screen.getByRole('button', { name: /rename/i });
        const deleteButton = screen.getByRole('button', { name: /delete/i });

        // Should not throw errors when callbacks are undefined
        expect(() => fireEvent.click(renameButton)).not.toThrow();
        expect(() => fireEvent.click(deleteButton)).not.toThrow();
      });
    });
  });

  describe('ActionContent standalone behavior', () => {
    it('renders all action buttons with icons and text', () => {
      renderWithProviders(
        <ActionContent onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      const viewDetailButton = screen.getByRole('button', { name: /view details/i });
      const renameButton = screen.getByRole('button', { name: /rename/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(viewDetailButton).toBeInTheDocument();
      expect(renameButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Check that icons are present (they render as SVG elements)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3); // At least 3 icons should be present
    });

    it('displays internationalized text correctly', () => {
      renderWithProviders(
        <ActionContent onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      // Should show translated text (exact text depends on i18n setup)
      expect(screen.getByText(/view details/i)).toBeInTheDocument();
      expect(screen.getByText(/rename/i)).toBeInTheDocument();
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });

    it('handles view detail action when used standalone', () => {
      renderWithProviders(
        <ActionContent onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      const viewDetailButton = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailButton);

      expect(mockOnViewDetail).toHaveBeenCalledTimes(1);
    });

    it('handles rename action when used standalone', () => {
      renderWithProviders(
        <ActionContent onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      expect(mockOnRename).toHaveBeenCalledTimes(1);
    });

    it('handles delete action when used standalone', () => {
      renderWithProviders(
        <ActionContent onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('works as context menu in table scenarios', async () => {
      // Simulate usage in table context
      const mockPresentationData = {
        id: '1',
        title: 'Test Presentation',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
      };

      const handleViewDetail = vi.fn();
      const handleRename = vi.fn();
      const handleDelete = vi.fn();

      renderWithProviders(
        <ActionContent
          onViewDetail={() => handleViewDetail(mockPresentationData)}
          onRename={() => handleRename(mockPresentationData)}
          onDelete={() => handleDelete(mockPresentationData)}
        />
      );

      // Test view detail flow
      const viewDetailButton = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailButton);

      expect(handleViewDetail).toHaveBeenCalledWith(mockPresentationData);

      // Test rename flow
      const renameButton = screen.getByRole('button', { name: /rename/i });
      fireEvent.click(renameButton);

      expect(handleRename).toHaveBeenCalledWith(mockPresentationData);

      // Test delete flow
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(handleDelete).toHaveBeenCalledWith(mockPresentationData);
    });

    it('shows appropriate hover states', () => {
      renderWithProviders(
        <ActionButton onViewDetail={mockOnViewDetail} onRename={mockOnRename} onDelete={mockOnDelete} />
      );

      const triggerIcon = document.querySelector('.lucide-ellipsis-vertical');

      // Test hover styling exists
      expect(triggerIcon).toHaveClass('hover:text-gray-700');
    });
  });
});
