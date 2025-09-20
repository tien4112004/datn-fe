import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineWorkspace from '@/features/presentation/components/generation/OutlineWorkspace';
import { renderWithProviders } from '@/tests/test-utils';

describe('OutlineWorkspace', () => {
  const mockOnDownload = vi.fn();

  const defaultProps = {
    onDownload: mockOnDownload,
    totalSlide: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnDownload.mockReset();
  });

  it('renders add button with correct text', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText(/add outline card/i)).toHaveRole('button');
  });

  it('adds new item when add button is clicked', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const addButton = screen.getByText(/add outline card/i);
    fireEvent.click(addButton);

    const newCard = screen.getByText(/1 outline card/i);
    expect(newCard).toBeInTheDocument();
  });

  it('renders download button', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText(/download/i)).toHaveRole('button');
  });

  it('calls onDownload when download button is clicked', async () => {
    mockOnDownload.mockResolvedValue(undefined);
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(mockOnDownload).toHaveBeenCalled();
  });

  it('shows loading state during download', async () => {
    let resolveDownload: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    mockOnDownload.mockReturnValue(downloadPromise);

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(screen.getByText(/downloading/i)).toBeInTheDocument();

    await act(async () => {
      resolveDownload!();
      await downloadPromise;
    });

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });
  });

  it('disables download button during download', async () => {
    let resolveDownload: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    mockOnDownload.mockReturnValue(downloadPromise);

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(downloadButton.closest('button')).toBeDisabled();

    await act(async () => {
      resolveDownload!();
      await downloadPromise;
    });

    await waitFor(() => {
      expect(downloadButton.closest('button')).not.toBeDisabled();
    });
  });

  it('handles missing onDownload prop', async () => {
    renderWithProviders(<OutlineWorkspace totalSlide={3} />);
    const downloadButton = screen.getByText(/download/i);

    // Should not throw error
    expect(downloadButton).toBeInTheDocument();
  });

  it('prevents multiple simultaneous downloads', async () => {
    let resolveFirstDownload: () => void;
    const firstDownloadPromise = new Promise<void>((resolve) => {
      resolveFirstDownload = resolve;
    });
    mockOnDownload.mockImplementation(() => firstDownloadPromise);

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    // Click twice rapidly
    fireEvent.click(downloadButton);
    fireEvent.click(downloadButton);

    // Should only be called once due to isDownloading state
    expect(mockOnDownload).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirstDownload!();
      await firstDownloadPromise;
    });

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });
  });

  it('handles download errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the download function to throw an error
    mockOnDownload.mockImplementation(async () => {
      throw new Error('Download failed');
    });

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
      // Wait for the async error handling to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });

    expect(downloadButton.closest('button')).not.toBeDisabled();
    consoleErrorSpy.mockRestore();
  });
});
