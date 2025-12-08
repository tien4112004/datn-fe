import React, { useState } from 'react';
import { useCreatePost } from '../hooks/useApi';
import type { PostCreateRequest } from '../types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Paperclip, Plus } from 'lucide-react';
import { LessonListCommand, ResourceListCommand } from '../../class-lesson/components';
import type { Lesson, LessonResource } from '../../class-lesson';

interface PostCreatorProps {
  classId: string;
  onPostCreated?: () => void;
  className?: string;
}

export const PostCreator = ({ classId, onPostCreated, className = '' }: PostCreatorProps) => {
  const { t } = useTranslation('classes');
  const createPost = useCreatePost();
  const editor = useRichTextEditor();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'post' | 'announcement'>('post');
  const [title, setTitle] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkedLessons, setLinkedLessons] = useState<Array<Lesson>>([]);
  const [linkedResources, setLinkedResources] = useState<Array<LessonResource>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor || editor.document.length === 0) return;

    try {
      const contentHtml = await editor.blocksToFullHTML(editor.document);

      const request: PostCreateRequest = {
        classId,
        type,
        title: type === 'announcement' ? title : '',
        content: contentHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
        linkedLessonIds: linkedLessons.length > 0 ? linkedLessons.map((l) => l.id) : undefined,
        linkedResourceIds: linkedResources.length > 0 ? linkedResources.map((r) => r.id) : undefined,
      };

      await createPost.mutateAsync(request);

      // Reset form
      setTitle('');
      editor.replaceBlocks(editor.document, []);
      setAttachments([]);
      setLinkedLessons([]);
      setLinkedResources([]);
      setOpen(false);

      onPostCreated?.();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = editor && editor.document.length > 0 && !createPost.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${className}`}>
          <Plus className="mr-2 h-4 w-4" />
          {t('feed.creator.actions.createPost')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('feed.creator.dialog.title')}</DialogTitle>
          <DialogDescription>{t('feed.creator.dialog.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label className="text-sm font-medium">{t('feed.creator.labels.postType')}</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'post' | 'announcement')}
              className="mt-2 flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="post" id="post" />
                <Label htmlFor="post">{t('feed.creator.postType.post')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="announcement" id="announcement" />
                <Label htmlFor="announcement">{t('feed.creator.postType.announcement')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="title">{t('feed.creator.labels.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('feed.creator.placeholders.title')}
              maxLength={100}
              className="border-border mt-1 shadow-none"
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <Label htmlFor="content">{t('feed.creator.labels.content')}</Label>
            <RichTextEditor
              editor={editor}
              minimalToolbar={true}
              sideMenu={false}
              className="min-h-[200px] rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Link Lessons */}
          <div className="mb-4">
            <Label className="text-sm font-medium">{t('feed.creator.labels.linkLessons')}</Label>
            <div className="mt-2">
              <LessonListCommand
                onLessonsSelect={function (lessons: Array<Lesson>): void {
                  setLinkedLessons(lessons);
                }}
              />
            </div>
          </div>

          {/* Link Resources */}
          <div className="mb-4">
            <Label className="text-sm font-medium">{t('feed.creator.labels.linkResources')}</Label>
            <div className="mt-2">
              <ResourceListCommand
                onResourcesSelect={function (resources: Array<LessonResource>): void {
                  setLinkedResources(resources);
                }}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <Label>{t('feed.creator.labels.attachments')}</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {t('feed.creator.actions.attachFiles')}
              </label>

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Paperclip size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {createPost.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{createPost.error.message}</p>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t('feed.creator.actions.cancel')}
          </Button>
          <Button type="submit" disabled={!canSubmit} onClick={handleSubmit}>
            {createPost.isPending ? t('feed.creator.actions.posting') : t('feed.creator.actions.post')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
