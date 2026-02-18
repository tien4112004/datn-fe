import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Button } from '@ui/button';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { postEditorSchema } from '../validation/postSchema';

interface PostEditorProps {
  initialContent: string;
  onCancel?: () => void;
  onSave: (markdown: string) => Promise<void> | void;
  isSaving?: boolean;
}

export const PostEditor = ({ initialContent, onCancel, onSave, isSaving = false }: PostEditorProps) => {
  const { t } = useTranslation('classes');
  const editor = useRichTextEditor({ trailingBlock: false });
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load markdown into editor blocks
  useEffect(() => {
    if (!editor) return;

    const load = async () => {
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent || '');
        editor.replaceBlocks(editor.document, blocks);
        setTimeout(() => editor.focus(), 0);
      } catch (error) {
        console.error('Failed to load markdown to editor:', error);
        setError(t('feed.post.edit.saveFailed'));
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, initialContent]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setError(null);

    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);

      // Zod validation - schema messages are i18n keys
      const parsed = postEditorSchema.safeParse({ content: md });
      if (!parsed.success) {
        const key = parsed.error.errors[0]?.message || 'feed.post.edit.empty';
        const msg = t(key as any);
        toast.error(msg);
        setError(msg);
        return;
      }

      await onSave(md);
      setDirty(false);
      setError(null);
    } catch (err: any) {
      const msg = (err && err.message) || t('feed.post.edit.saveFailed');
      setError(msg);
      // Also show toast for visibility
      toast.error(msg);
    }
  }, [editor, onSave, t]);

  const handleCancel = useCallback(() => {
    setError(null);
    onCancel?.();
  }, [onCancel]);

  const handleEditorChange = useCallback(async () => {
    if (!editor) return;
    setError(null);
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      setDirty(md !== initialContent);
    } catch (err) {
      console.error('Failed to convert blocks to markdown:', err);
      setError(t('feed.post.edit.saveFailed'));
    }
  }, [editor, initialContent, t]);

  // keyboard shortcuts
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    }

    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    if (isCmdOrCtrl && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div onKeyDown={onKeyDown} className="mb-2 ml-9 md:mb-3 md:ml-[52px]">
      <div className={`rounded-md border p-2 ${error ? 'border-red-500 ring-2 ring-red-200' : ''}`}>
        <RichTextEditor
          data-post-editor
          editor={editor}
          onChange={handleEditorChange}
          sideMenu={false}
          className="min-h-[80px]"
        />

        <div className="mt-3 flex items-center justify-end gap-2">
          <div className="flex-1">{error && <p className="text-sm text-red-600">{error}</p>}</div>

          <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
            {t('feed.post.edit.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || loading || !dirty}>
            {isSaving ? t('feed.post.edit.saving') : t('feed.post.edit.save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
