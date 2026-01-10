import type { OutlineItem } from '@/features/presentation/types';
import { marked } from 'marked';

export default function splitMarkdownToOutlineItems(markdown: string): OutlineItem[] {
  const cleanMarkdown = markdown
    .replace(/^```markdown\n/, '')
    .replace(/```/, '')
    .trim();

  // Split the markdown into sections based on '---' delimiters
  const sections = cleanMarkdown.split(/---+/).filter(Boolean);
  const items = sections.map((section, index) => ({
    id: index.toString(),
    htmlContent: marked.parse(section.trim(), {
      async: false,
    }),
    markdownContent: section.trim(),
  }));

  return items;
}
