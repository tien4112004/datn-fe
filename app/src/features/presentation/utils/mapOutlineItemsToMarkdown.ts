import type { OutlineItem } from '@/features/presentation/types';

export default function mapOutlineItemsToMarkdown(items: OutlineItem[]): string {
  if (!items || items.length === 0) {
    return '';
  }

  const markdown = items.map((item) => item.markdownContent || '').join('\n\n');

  return `\`\`\`markdown\n\n${markdown}\n\n\`\`\``;
}
