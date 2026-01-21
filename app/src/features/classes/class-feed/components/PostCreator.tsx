import React, { useState } from 'react';
import { useCreatePost } from '../hooks/useApi';
import { useAttachmentUpload } from '../hooks/useAttachmentUpload';
import type { PostCreateRequest } from '../types';
import type { LinkedResource } from '../types/resource';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Paperclip, Plus, X, Link2, BrainCircuit, Presentation, ClipboardList, Loader2 } from 'lucide-react';
import { LessonListCommand, AssignmentListCommand } from '../../class-lesson/components';
import type { Lesson } from '../../class-lesson';
import { Separator } from '@/shared/components/ui/separator';
import { ResourceSelectorDialog } from './resource-selector';
import { getAcceptString, formatFileSize } from '../utils/attachmentValidation';
import { Progress } from '@/shared/components/ui/progress';

interface Assignment {
  id: string;
  title: string;
}

interface PostCreatorProps {
  classId: string;
  onPostCreated?: () => void;
  className?: string;
  initialType?: 'Post' | 'Homework';
}

export const PostCreator = ({
  classId,
  onPostCreated,
  className = '',
  initialType = 'Post',
}: PostCreatorProps) => {
  const { t } = useTranslation('classes');
  const createPost = useCreatePost();
  const editor = useRichTextEditor();
  const {
    uploadedUrls,
    pendingFiles,
    isUploading,
    uploadProgress,
    addFiles,
    removePendingFile,
    uploadAll,
    clear: clearAttachments,
  } = useAttachmentUpload();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'Post' | 'Homework'>(initialType);
  const [linkedLessons, setLinkedLessons] = useState<Array<Lesson>>([]);
  const [linkedResources, setLinkedResources] = useState<Array<LinkedResource>>([]);
  const [resourceSelectorOpen, setResourceSelectorOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [allowComments, setAllowComments] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor || editor.document.length === 0) return;

    try {
      // Upload pending attachments first
      let attachmentUrls: string[] = [];
      if (type === 'Post' && (pendingFiles.length > 0 || uploadedUrls.length > 0)) {
        attachmentUrls = await uploadAll();
      }

      const contentMd = await editor.blocksToMarkdownLossy(editor.document);

      const request: PostCreateRequest = {
        classId,
        type,
        content: contentMd,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
        linkedLessonId: type === 'Post' && linkedLessons.length > 0 ? linkedLessons[0].id : undefined,
        linkedResources:
          type === 'Post' && linkedResources.length > 0
            ? linkedResources.map((r) => ({
                type: r.type,
                id: r.id,
                permissionLevel: r.permissionLevel || 'view',
              }))
            : undefined,
        assignmentId: type === 'Homework' && selectedAssignment ? selectedAssignment.id : undefined,
        allowComments,
      };

      await createPost.mutateAsync(request);

      // Reset form
      editor.replaceBlocks(editor.document, []);
      clearAttachments();
      setLinkedLessons([]);
      setLinkedResources([]);
      setSelectedAssignment(null);
      setType(initialType);
      setAllowComments(true);
      setOpen(false);

      onPostCreated?.();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const canSubmit = editor && editor.document.length > 0 && !createPost.isPending && !isUploading;

  const buttonText =
    initialType === 'Homework'
      ? t('feed.creator.actions.createHomework')
      : t('feed.creator.actions.createPost');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] !max-w-3xl overflow-y-auto px-4 md:max-h-[90vh] md:px-6">
        <DialogHeader>
          <DialogTitle>{t('feed.creator.dialog.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.creator.labels.postType')}</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'Post' | 'Homework')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Post" id="post" />
                <Label htmlFor="post" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.post')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Homework" id="homework" />
                <Label htmlFor="homework" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.homework')}
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
                className="min-h-[150px] p-2 md:min-h-[200px] md:p-3"
              />
            </div>
          </div>

          <Separator />

          {/* Conditional Fields based on Post Type */}
          {type === 'Homework' ? (
            /* Assignment Selector */
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('feed.creator.labels.selectAssignment')}</Label>
              <AssignmentListCommand onAssignmentSelect={(assignment) => setSelectedAssignment(assignment)} />
              {selectedAssignment && (
                <p className="text-muted-foreground text-xs">Selected: {selectedAssignment.title}</p>
              )}
            </div>
          ) : (
            <>
              {/* Attachments, Lessons, Resources - Only for Post type */}
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
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
                      accept={getAcceptString()}
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                        disabled={isUploading}
                      >
                        <span className="cursor-pointer">
                          <Paperclip className="mr-2 h-4 w-4" />
                          {t('feed.creator.actions.attachFiles')}
                        </span>
                      </Button>
                    </label>

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-2 space-y-1">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Uploading... {uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    )}

                    {/* Pending files list */}
                    {pendingFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {pendingFiles.map((pf) => (
                          <div
                            key={pf.id}
                            className="bg-muted/30 flex items-center justify-between rounded border px-2 py-1.5 text-sm"
                          >
                            <div className="flex flex-col truncate">
                              <span className="truncate">{pf.file.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {formatFileSize(pf.file.size)}
                              </span>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removePendingFile(pf.id)}
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              disabled={isUploading}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResourceSelectorOpen(true)}
                  className="w-full justify-start"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {linkedResources.length > 0
                    ? t('feed.creator.resourcesSelected', { count: linkedResources.length })
                    : t('feed.creator.selectResources')}
                </Button>

                {/* Selected resources chips */}
                {linkedResources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {linkedResources.map((resource) => {
                      const Icon =
                        resource.type === 'mindmap'
                          ? BrainCircuit
                          : resource.type === 'presentation'
                            ? Presentation
                            : ClipboardList;
                      return (
                        <div
                          key={`${resource.type}:${resource.id}`}
                          className="bg-secondary flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="max-w-[150px] truncate">{resource.title}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setLinkedResources((prev) =>
                                prev.filter((r) => !(r.type === resource.type && r.id === resource.id))
                              )
                            }
                            className="hover:text-destructive ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <ResourceSelectorDialog
                  open={resourceSelectorOpen}
                  onOpenChange={setResourceSelectorOpen}
                  initialSelection={linkedResources}
                  onConfirm={setLinkedResources}
                />
              </div>
            </>
          )}

          {/* Allow Comments */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowComments"
              checked={allowComments}
              onCheckedChange={(checked) => setAllowComments(checked === true)}
            />
            <Label
              htmlFor="allowComments"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('feed.creator.labels.allowComments')}
            </Label>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              {t('feed.creator.actions.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : createPost.isPending ? (
                t('feed.creator.actions.posting')
              ) : (
                t('feed.creator.actions.post')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
