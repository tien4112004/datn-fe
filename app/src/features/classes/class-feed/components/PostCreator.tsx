import React, { useState } from 'react';
import { useCreatePost } from '../hooks/useApi';
import type { PostCreateRequest } from '../types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Paperclip, Plus, X } from 'lucide-react';
import { LessonListCommand, ResourceListCommand } from '../../class-lesson/components';
import type { Lesson, LessonResource } from '../../class-lesson';
import { Separator } from '@/shared/components/ui/separator';

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
  const [type, setType] = useState<'general' | 'announcement' | 'schedule_event'>('general');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkedLessons, setLinkedLessons] = useState<Array<Lesson>>([]);
  const [linkedResources, setLinkedResources] = useState<Array<LessonResource>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor || editor.document.length === 0) return;

    try {
      const contentMd = await editor.blocksToMarkdownLossy(editor.document);

      const request: PostCreateRequest = {
        classId,
        type,
        content: contentMd,
        attachments: attachments.length > 0 ? attachments : undefined,
        linkedLessonId: linkedLessons.length > 0 ? linkedLessons[0].id : undefined,
        linkedResourceIds: linkedResources.length > 0 ? linkedResources.map((r) => r.id) : undefined,
      };

      await createPost.mutateAsync(request);

      // Reset form
      editor.replaceBlocks(editor.document, []);
      setAttachments([]);
      setLinkedLessons([]);
      setLinkedResources([]);
      setType('general');
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
        <Button className={className}>
          <Plus className="mr-2 h-4 w-4" />
          {t('feed.creator.actions.createPost')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('feed.creator.dialog.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.creator.labels.postType')}</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'general' | 'announcement' | 'schedule_event')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.general')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="announcement" id="announcement" />
                <Label htmlFor="announcement" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.announcement')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="schedule_event" id="schedule_event" />
                <Label htmlFor="schedule_event" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.schedule_event')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Content Editor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('feed.creator.labels.content')}</Label>
            <div className="rounded-lg border">
              <RichTextEditor
                editor={editor}
                minimalToolbar={true}
                sideMenu={false}
                className="min-h-[200px] p-3"
              />
            </div>
          </div>

          <Separator />

          {/* Attachments, Lessons, Resources */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('feed.creator.labels.attachments')}</Label>
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Paperclip className="mr-2 h-4 w-4" />
                      {t('feed.creator.actions.attachFiles')}
                    </span>
                  </Button>
                </label>

                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 flex items-center justify-between rounded border px-2 py-1.5 text-sm"
                      >
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Link Lessons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('feed.creator.labels.linkLessons')}</Label>
              <LessonListCommand
                onLessonsSelect={function (lessons: Array<Lesson>): void {
                  setLinkedLessons(lessons);
                }}
              />
              {linkedLessons.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {linkedLessons.length} lesson{linkedLessons.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Link Resources */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('feed.creator.labels.linkResources')}</Label>
            <ResourceListCommand
              onResourcesSelect={function (resources: Array<LessonResource>): void {
                setLinkedResources(resources);
              }}
            />
            {linkedResources.length > 0 && (
              <p className="text-muted-foreground text-xs">
                {linkedResources.length} resource{linkedResources.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Error Message */}
          {createPost.error && (
            <div className="border-destructive bg-destructive/10 rounded-md border-l-4 p-3">
              <p className="text-destructive text-sm">{createPost.error.message}</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('feed.creator.actions.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createPost.isPending ? t('feed.creator.actions.posting') : t('feed.creator.actions.post')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
