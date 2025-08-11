import { render, screen } from '@testing-library/react';
import OutlineCard from "@/features/presentation/components/generation/OutlineCard";
import { describe, expect, it, vi } from 'vitest';
// import type { BlockNoteEditor, InlineContentSchema, StyleSchema } from '@blocknote/core';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/shared/components/rte/RichTextEditor', () => ({
  default: () => {
    return <div>RichTextEditor</div>;
  }
}));

describe('OutlineCard', () => {
  const standardProps = {
    id: 'test-id',
    title: 'Test Title',
    item: {
      id: 'item-id',
      htmlContent: '<p>Test content</p><h1>Test Heading</h1>',
    },
  }
  
  it('should render without crashing', () => {
    render(<OutlineCard {...standardProps}/>);

    const card = screen.getByText('Test Title');
    expect(card).toBeInTheDocument();
  });
});