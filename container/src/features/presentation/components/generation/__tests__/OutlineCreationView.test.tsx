import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import OutlineCreationView from '../OutlineCreationView';
import type { ModelOption } from '@/features/model';
// import type { OutlineData } from '@/features/presentation/types';

const defaultModel: ModelOption = {
  id: 'gpt-4o-mini',
  name: 'gpt-4o-mini',
  displayName: 'GPT-4o Mini',
};

// const models = [
//   defaultModel,
//   { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
// ];

// vi.mock('@/features/model', () => ({
//   useModels: () => ({ models }),
// }));

// vi.mock('react-i18next', () => ({
//   useTranslation: () => ({ t: (key: string) => key }),
// }));

describe('OutlineCreationView', () => {
  it('renders all form fields', () => {
    renderWithProviders(<OutlineCreationView defaultModel={defaultModel} onCreateOutline={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('Describe your topic or what you want to present...')
    ).toBeInTheDocument();
  });

  it('updates topic input', async () => {
    renderWithProviders(<OutlineCreationView defaultModel={defaultModel} onCreateOutline={vi.fn()} />);
    const topicInput = screen.getByPlaceholderText('Describe your topic or what you want to present...');
    await userEvent.type(topicInput, 'AI presentation');
    expect(topicInput).toHaveValue('AI presentation');
  });

  it('submits correct data', async () => {
    const handleCreate = vi.fn();
    renderWithProviders(<OutlineCreationView defaultModel={defaultModel} onCreateOutline={handleCreate} />);
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
