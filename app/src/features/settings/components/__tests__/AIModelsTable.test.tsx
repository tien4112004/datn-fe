import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import AIModelsTable from '../AIModelsTable';
import type { Model } from '@/features/model/types/model';
import { useModels, usePatchModel } from '@/features/model/hooks/useApi';

// Mock the hooks
vi.mock('@/features/model/hooks/useApi', () => ({
  useModels: vi.fn(),
  usePatchModel: vi.fn(),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useTranslation: vi.fn(() => ({
      t: (key: string) => {
        return key;
      },
    })),
  };
});

const mockModels: Model[] = [
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: true,
    provider: 'openai',
    type: 'TEXT',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    enabled: false,
    default: false,
    provider: 'openai',
    type: 'TEXT',
  },
  {
    id: 'claude-3-sonnet',
    name: 'claude-3-sonnet',
    displayName: 'Claude 3 Sonnet',
    enabled: true,
    default: false,
    provider: 'anthropic',
    type: 'TEXT',
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

      expect(screen.getByText('devtools.aiModels.title')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.loading')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.loadingModels')).toBeInTheDocument();
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

      expect(screen.getByText('devtools.aiModels.title')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.errorLoading')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.errorMessage')).toBeInTheDocument();
    });
  });

  describe('Models Table', () => {
    it('renders models table with correct headers', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('devtools.aiModels.columns.model')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.columns.provider')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.columns.mediaTypes')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.columns.modelId')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.columns.status')).toBeInTheDocument();
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
      const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
      mockUsePatchModel.mockReturnValue({
        mutate: mockPatchModelMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        error: null,
        data: undefined,
        isSuccess: false,
        isIdle: true,
        reset: vi.fn(),
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        isPaused: false,
        status: 'idle',
        submittedAt: 0,
        context: undefined,
      } as any);

      const user = userEvent.setup();
      renderWithProviders(<AIModelsTable />);

      const switches = screen.getAllByRole('switch');

      await user.click(switches[0]); // Toggle GPT-4o Mini

      expect(mockMutateAsync).toHaveBeenCalledWith({
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

      expect(screen.getByText('devtools.aiModels.defaultModels.title')).toBeInTheDocument();
      expect(screen.getByText('devtools.aiModels.defaultModels.subtitle')).toBeInTheDocument();
    });

    it('shows current default model information', () => {
      renderWithProviders(<AIModelsTable />);

      expect(screen.getByText('devtools.aiModels.defaultModels.currentModel')).toBeInTheDocument();
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

      const selectTriggers = screen.getAllByRole('combobox');
      selectTriggers.forEach((selectTrigger) => {
        expect(selectTrigger).toBeDisabled();
      });
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

      // Should show "devtools.aiModels.defaultModels.noModelsAvailable" in select placeholders
      const noModelsText = screen.getAllByText('devtools.aiModels.defaultModels.noModelsAvailable');
      expect(noModelsText.length).toBeGreaterThan(0);
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

      expect(screen.getByText('devtools.aiModels.title')).toBeInTheDocument();
      // Should show "devtools.aiModels.defaultModels.noModelsAvailable" in select placeholders
      const noModelsText = screen.getAllByText('devtools.aiModels.defaultModels.noModelsAvailable');
      expect(noModelsText.length).toBeGreaterThan(0);
    });
  });
});
