import { BlockNoteEditor } from '@blocknote/core';

/**
 * Converts BlockNote HTML content to Markdown format.
 * Uses lossy conversion which may lose some formatting details.
 */
export async function htmlToMarkdown(htmlContent: string): Promise<string> {
  if (!htmlContent || htmlContent.trim() === '') {
    return '';
  }

  const editor = BlockNoteEditor.create();
  try {
    const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
    const markdown = await editor.blocksToMarkdownLossy(blocks);
    return markdown.trim();
  } catch (error) {
    console.error('HTML to Markdown conversion failed:', error);
    // Fallback: strip HTML tags and return plain text
    return htmlContent.replace(/<[^>]*>/g, '').trim();
  }
}

/**
 * Converts Markdown content to BlockNote HTML format.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  const editor = BlockNoteEditor.create();
  try {
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    const html = await editor.blocksToFullHTML(blocks);
    return html;
  } catch (error) {
    console.error('Markdown to HTML conversion failed:', error);
    // Fallback: wrap in paragraph tags
    return `<p>${markdown}</p>`;
  }
}
