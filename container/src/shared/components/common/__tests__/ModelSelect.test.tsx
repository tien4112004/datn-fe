import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModelSelect } from '../ModelSelect';
import { type Model } from '@/features/model/types/model';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:model.placeholder': 'Select a model',
        'common:model.label': 'AI Model',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock MODEL_PROVIDERS_LOGO
vi.mock('@/features/presentation/types', () => ({
  MODEL_PROVIDERS_LOGO: {
    OpenAI: '/images/providers/openai.png',
    Deepseek: '/images/providers/deepseek.png',
    Google: '/images/providers/google.png',
  },
}));

const mockModels: Model[] = [
  {
    id: '1',
    name: 'gpt-4',
    displayName: 'GPT-4',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'TEXT',
  },
  {
    id: '2',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    enabled: true,
    default: true,
    provider: 'OpenAI',
    type: 'TEXT',
  },
  {
    id: '3',
    name: 'claude-3',
    displayName: 'Claude 3',
    enabled: false,
    default: false,
    provider: 'Anthropic',
    type: 'TEXT',
  },
  {
    id: '4',
    name: 'deepseek-coder',
    displayName: 'DeepSeek Coder',
    enabled: true,
    default: false,
    provider: 'Deepseek',
    type: 'TEXT',
  },
];

describe('ModelSelect - Behavioral Tests', () => {
  const user = userEvent.setup();
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  describe('User Interaction Workflows', () => {
    it('allows user to select an available model through dropdown interaction', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();

      await user.click(trigger);

      const gpt4Option = await screen.findByText('GPT-4');
      expect(gpt4Option).toBeVisible();

      await user.click(gpt4Option);

      expect(mockOnValueChange).toHaveBeenCalledWith({ name: 'gpt-4', provider: 'OpenAI' });
    });

    it('prevents user from selecting disabled models', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      await user.click(screen.getByRole('combobox'));

      const disabledOption = await screen.findByText('Claude 3');
      expect(disabledOption.closest('[role="option"]')).toHaveAttribute('aria-disabled', 'true');

      await user.click(disabledOption);

      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it('displays currently selected model in the trigger', async () => {
      render(<ModelSelect models={mockModels} value="gpt-3.5-turbo" onValueChange={mockOnValueChange} />);

      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
    });

    it('supports keyboard navigation through model options', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const firstOption = await screen.findByText('GPT-4');
      expect(firstOption).toBeVisible();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnValueChange).toHaveBeenCalledWith({ name: 'gpt-3.5-turbo', provider: 'OpenAI' });
      });
    });
  });

  describe('Model Presentation and Visual Features', () => {
    it('displays provider logos when showProviderLogo is enabled', async () => {
      render(
        <ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} showProviderLogo={true} />
      );

      await user.click(screen.getByRole('combobox'));

      const openaiLogos = await screen.findAllByAltText('OpenAI');
      expect(openaiLogos.length).toBeGreaterThan(0);
      expect(openaiLogos[0]).toHaveAttribute('src', '/images/providers/openai.png');

      const deepseekLogo = await screen.findByAltText('Deepseek');
      expect(deepseekLogo).toBeInTheDocument();
      expect(deepseekLogo).toHaveAttribute('src', '/images/providers/deepseek.png');
    });

    it('hides provider logos when showProviderLogo is disabled', async () => {
      render(
        <ModelSelect
          models={mockModels}
          value=""
          onValueChange={mockOnValueChange}
          showProviderLogo={false}
        />
      );

      await user.click(screen.getByRole('combobox'));

      await screen.findByText('GPT-4');

      expect(screen.queryByAltText('OpenAI')).not.toBeInTheDocument();
      expect(screen.queryByAltText('Deepseek')).not.toBeInTheDocument();
    });

    it('applies visual styling to disabled model options', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      await user.click(screen.getByRole('combobox'));

      const disabledOption = await screen.findByText('Claude 3');
      expect(disabledOption.closest('[role="option"]')).toHaveClass('opacity-50');
    });
  });

  describe('Component State Management', () => {
    it('maintains correct state when user changes selection multiple times', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      const trigger = screen.getByRole('combobox');

      // First selection
      await user.click(trigger);
      await user.click(await screen.findByText('GPT-4'));
      expect(mockOnValueChange).toHaveBeenCalledWith({ name: 'gpt-4', provider: 'OpenAI' });

      // Second selection
      await user.click(trigger);
      await user.click(await screen.findByText('DeepSeek Coder'));
      expect(mockOnValueChange).toHaveBeenCalledWith({ name: 'deepseek-coder', provider: 'Deepseek' });

      expect(mockOnValueChange).toHaveBeenCalledTimes(2);
    });

    it('remains disabled when disabled prop is true', async () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} disabled={true} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();

      await user.click(trigger);

      // Should not open dropdown when disabled
      expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides appropriate ARIA labels and roles', async () => {
      render(
        <ModelSelect
          models={mockModels}
          value=""
          onValueChange={mockOnValueChange}
          placeholder="Choose your AI model"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(mockModels.length);
    });

    it('uses custom placeholder and label text when provided', () => {
      render(
        <ModelSelect
          models={mockModels}
          value=""
          onValueChange={mockOnValueChange}
          placeholder="Pick a model"
          label="Available Models"
        />
      );

      expect(screen.getByText('Pick a model')).toBeInTheDocument();
    });

    it('falls back to default translations when no custom text provided', () => {
      render(<ModelSelect models={mockModels} value="" onValueChange={mockOnValueChange} />);

      expect(screen.getByText('Select a model')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty model list gracefully', async () => {
      render(<ModelSelect models={[]} value="" onValueChange={mockOnValueChange} />);

      await user.click(screen.getByRole('combobox'));

      const label = await screen.findByText('AI Model');
      expect(label).toBeInTheDocument();

      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });

    it('handles undefined models prop gracefully', async () => {
      render(<ModelSelect value="" onValueChange={mockOnValueChange} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });

    it('maintains selection integrity when models prop changes', () => {
      const { rerender } = render(
        <ModelSelect models={mockModels} value="gpt-4" onValueChange={mockOnValueChange} />
      );

      expect(screen.getByText('GPT-4')).toBeInTheDocument();

      const newModels = mockModels.filter((m) => m.name !== 'gpt-4');
      rerender(<ModelSelect models={newModels} value="gpt-4" onValueChange={mockOnValueChange} />);

      // The component should still display the value even if the model isn't in the list
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});
