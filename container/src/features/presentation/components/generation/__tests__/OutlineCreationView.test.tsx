import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import OutlineCreationView from '../OutlineCreationView';
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

describe('OutlineCreationView', () => {
  it('renders all form fields', () => {
    renderWithProviders(
      <OutlineCreationView models={models} defaultModel={defaultModel} onCreateOutline={vi.fn()} />
    );
    expect(
      screen.getByPlaceholderText('Describe your topic or what you want to present...')
    ).toBeInTheDocument();
  });

  it('updates topic input', async () => {
    renderWithProviders(
      <OutlineCreationView models={models} defaultModel={defaultModel} onCreateOutline={vi.fn()} />
    );
    const topicInput = screen.getByPlaceholderText('Describe your topic or what you want to present...');
    await userEvent.type(topicInput, 'AI presentation');
    expect(topicInput).toHaveValue('AI presentation');
  });

  it('submits correct data', async () => {
    const handleCreate = vi.fn();
    renderWithProviders(
      <OutlineCreationView models={models} defaultModel={defaultModel} onCreateOutline={handleCreate} />
    );
    await userEvent.type(
      screen.getByPlaceholderText('Describe your topic or what you want to present...'),
      'Test topic'
    );
    await userEvent.click(screen.getByRole('button', { name: /generate outline/i }));
    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'Test topic',
        slideCount: 10,
        language: 'en',
        model: 'gpt-4o-mini',
        targetAge: '7-10',
      })
    );
  });
});
