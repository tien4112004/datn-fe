import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import OutlineCreationView from '../OutlineCreationView';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';
import type { ModelOption } from '@/features/model';

const defaultModel: ModelOption = {
  id: 'gpt-4o-mini',
  name: 'gpt-4o-mini',
  displayName: 'GPT-4o Mini',
  enabled: true,
  default: true,
  provider: 'openai',
};

const models: ModelOption[] = [
  defaultModel,
  {
    id: 'gpt-3.5-turbo',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    enabled: true,
    default: false,
    provider: 'openai',
  },
];

// Mock useModels hook
vi.mock('@/features/model', () => ({
  useModels: vi.fn(() => ({
    models,
    defaultModel,
    isLoading: false,
    isError: false,
  })),
}));

describe('OutlineCreationView', () => {
  it('renders all form fields', () => {
    renderWithProviders(
      <PresentationFormProvider>
        <OutlineCreationView onCreateOutline={vi.fn()} />
      </PresentationFormProvider>
    );
    expect(
      screen.getByPlaceholderText('Describe your topic or what you want to present...')
    ).toBeInTheDocument();
  });

  it('updates topic input', async () => {
    renderWithProviders(
      <PresentationFormProvider>
        <OutlineCreationView onCreateOutline={vi.fn()} />
      </PresentationFormProvider>
    );
    const topicInput = screen.getByPlaceholderText('Describe your topic or what you want to present...');
    await userEvent.type(topicInput, 'AI presentation');
    expect(topicInput).toHaveValue('AI presentation');
  });

  it('submits correct data', async () => {
    const handleCreate = vi.fn();
    renderWithProviders(
      <PresentationFormProvider>
        <OutlineCreationView onCreateOutline={handleCreate} />
      </PresentationFormProvider>
    );
    await userEvent.type(
      screen.getByPlaceholderText('Describe your topic or what you want to present...'),
      'Test topic'
    );
    await userEvent.click(screen.getByRole('button', { name: /generate outline/i }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });
});
