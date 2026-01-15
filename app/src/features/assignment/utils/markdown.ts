import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  return marked.parse(markdown, { async: false }) as string;
};

export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  // Basic markdown strip for plain text preview
  return markdown
    .replace(/[#*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
};
