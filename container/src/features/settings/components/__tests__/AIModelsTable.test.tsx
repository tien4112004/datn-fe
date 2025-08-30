import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import AIModelsTable from '../AIModelsTable';
import type { ModelOption } from '@/features/model/types/model';

// Mock the hooks
vi.mock('@/features/model/hooks/useApi', () => ({
  useModels: vi.fn(),
  usePatchModel: vi.fn(),
}));

import { useModels, usePatchModel } from '@/features/model/hooks/useApi';

const mockModels: ModelOption[] = [
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: true,
    provider: 'openai',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    enabled: false,
    default: false,
    provider: 'openai',
  },
  {
    id: 'claude-3-sonnet',
    name: 'claude-3-sonnet',
    displayName: 'Claude 3 Sonnet',
    enabled: true,
    default: false,
    provider: 'anthropic',
  },
];

describe('AIModelsTable', () => {
  const mockPatchModelMutate = vi.fn();
  const mockUseModels = vi.mocked(useModels);
  const mockUsePatchModel = vi.mocked(usePatchModel);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseModels.mockReturnValue({
      models: mockModels,
      defaultModel: mockModels[0],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUsePatchModel.mockReturnValue({
      mutate: mockPatchModelMutate,
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      isSuccess: false,
      isIdle: true,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      variables: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle',
      submittedAt: 0,
      context: undefined,
    } as any);
  });

  describe('Loading State', () => {
    it('renders loading state when models are being fetched', () => {
      mockUseModels.mockReturnValue({
        models: undefined,
        defaultModel: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('AI Models')).toBeInTheDocument();
      expect(screen.getByText('Loading available AI models...')).toBeInTheDocument();
      expect(screen.getByText('Loading models...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when models fail to load', () => {
      mockUseModels.mockReturnValue({
        models: undefined,
        defaultModel: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('AI Models')).toBeInTheDocument();
      expect(screen.getByText('Failed to load AI models.')).toBeInTheDocument();
      expect(screen.getByText('Error loading models. Please try again later.')).toBeInTheDocument();
    });
  });

  describe('Models Table', () => {
    it('renders models table with correct headers', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('Model')).toBeInTheDocument();
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('Media Types')).toBeInTheDocument();
      expect(screen.getByText('Model ID')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders all models in the table', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('GPT-4o Mini')).toBeInTheDocument();
      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(screen.getByText('Claude 3 Sonnet')).toBeInTheDocument();
    });

    it('displays model providers correctly', () => {
      renderWithProviders(<AIModelsTable />);

      const providers = screen.getAllByText('openai');
      expect(providers).toHaveLength(2);
      expect(screen.getByText('anthropic')).toBeInTheDocument();
    });
  });

  describe('Model Toggle Functionality', () => {
    it('calls patch model when toggle switch is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AIModelsTable />);

      const switches = screen.getAllByRole('switch');

      await user.click(switches[0]); // Toggle GPT-4o Mini

      expect(mockPatchModelMutate).toHaveBeenCalledWith({
        modelId: 'gpt-4o-mini',
        data: { enabled: false }, // Should toggle from true to false
      });
    });

    it('disables switches during patch operation', () => {
      mockUsePatchModel.mockReturnValue({
        mutate: mockPatchModelMutate,
        isPending: true,
        isError: false,
        error: null,
        data: undefined,
        isSuccess: false,
        isIdle: false,
        reset: vi.fn(),
        mutateAsync: vi.fn(),
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        isPaused: false,
        status: 'pending',
        submittedAt: Date.now(),
        context: undefined,
      } as any);

      renderWithProviders(<AIModelsTable />);

      const switches = screen.getAllByRole('switch');
      switches.forEach((switchEl) => {
        expect(switchEl).toBeDisabled();
      });
    });
  });

  describe('Default Models Section', () => {
    it('renders default models section', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('Default Models')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Set the default model for each media type. Only enabled models are available for selection.'
        )
      ).toBeInTheDocument();
    });

    it('shows current default model information', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText(/Current: gpt-4o-mini by openai/)).toBeInTheDocument();
    });

    it('disables select during patch operation', () => {
      mockUsePatchModel.mockReturnValue({
        mutate: mockPatchModelMutate,
        isPending: true,
        isError: false,
        error: null,
        data: undefined,
        isSuccess: false,
        isIdle: false,
        reset: vi.fn(),
        mutateAsync: vi.fn(),
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        isPaused: false,
        status: 'pending',
        submittedAt: Date.now(),
        context: undefined,
      } as any);

      renderWithProviders(<AIModelsTable />);

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeDisabled();
    });

    it('shows no models available message when no enabled models exist', () => {
      mockUseModels.mockReturnValue({
        models: mockModels.map((model) => ({ ...model, enabled: false })),
        defaultModel: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<AIModelsTable />);

      expect(
        screen.getByText('No enabled models available. Enable at least one model to set defaults.')
      ).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('handles empty models array gracefully', () => {
      mockUseModels.mockReturnValue({
        models: [],
        defaultModel: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('AI Models')).toBeInTheDocument();
      expect(
        screen.getByText('No enabled models available. Enable at least one model to set defaults.')
      ).toBeInTheDocument();
    });
  });
});
