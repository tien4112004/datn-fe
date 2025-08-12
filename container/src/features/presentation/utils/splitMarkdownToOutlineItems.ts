import type { OutlineItem } from '@/features/presentation/types';
import { marked } from 'marked';

export default function splitMarkdownToOutlineItems(markdown: string): OutlineItem[] {
  const cleanMarkdown = markdown
    .replace(/^```markdown\n/, '')
    .replace(/\n```$/, '')
    .trim();

  // Split the markdown into sections based on headings (## and above)
  const sections = cleanMarkdown.split(/(?=^#{2,}\s)/m).filter(Boolean);

  const items = sections.map((section, index) => ({
    id: index.toString(),
    htmlContent: marked.parse(section.trim(), {
      async: false,
    }),
  }));

  return items;
}
