import { ResourceSelectorDialog } from '@/features/projects/components/resource-selector';
import type { LinkedResource } from '@/features/projects/types/resource';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Separator } from '@/shared/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BrainCircuit,
  ClipboardList,
  Eye,
  Link2,
  Loader2,
  MessageSquare,
  CalendarIcon,
  Paperclip,
  Plus,
  Presentation,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreatePost } from '../hooks/useApi';
import { useAttachmentUpload } from '../hooks/useAttachmentUpload';
import { PostType, type PostCreateRequest } from '../types';
import { formatFileSize, getAcceptString } from '../utils/attachmentValidation';
import { postEditorSchema } from '../validation/postSchema';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { cn } from '@/shared/lib/utils';
import { AssignmentListCommand } from './AssignmentListCommand';
import { format } from 'date-fns/format';
import type { Assignment } from '@/features/assignment';
import { Calendar } from '@/components/ui/calendar';

interface PostCreatorProps {
  classId: string;
  onPostCreated?: () => void;
  className?: string;
  initialType?: PostType;
}

export const PostCreator = ({
  classId,
  onPostCreated,
  className = '',
  initialType = PostType.Post,
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
  const [type, setType] = useState<PostType>(initialType);
  const [linkedResources, setLinkedResources] = useState<Array<LinkedResource>>([]);
  const [resourceSelectorOpen, setResourceSelectorOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [allowComments, setAllowComments] = useState(true);

  // Assignment settings (for Exercise type)
  const [maxSubmissions, setMaxSubmissions] = useState<number | undefined>(undefined);
  const [allowRetake, setAllowRetake] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  const [passingScore, setPassingScore] = useState<number | undefined>(undefined);
  const [availableFrom, setAvailableFrom] = useState<string>('');
  const [availableUntil, setAvailableUntil] = useState<string>('');
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);

  // Sync type with initialType when it changes (e.g., when filter switches to Exercise)
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  // Form for content validation
  const form = useForm<{ content: string }>({
    resolver: zodResolver(postEditorSchema),
    defaultValues: { content: '' },
    mode: 'onSubmit',
  });

  const {
    handleSubmit: handleFormSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Keep editor content in sync with the form
  const handleEditorChange = useCallback(async () => {
    if (!editor) return;
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      setValue('content', md, { shouldValidate: false, shouldDirty: true });
      setAttachmentErrors([]);
    } catch (err) {
      console.error('Failed to convert blocks to markdown:', err);
    }
  }, [editor, setValue]);

  // Initial sync when editor is ready
  useEffect(() => {
    if (!editor) return;
    // ensure form content is in sync when editor is focused/used
    handleEditorChange();
  }, [editor, handleEditorChange]);

  const onSubmit = handleFormSubmit(async (data) => {
    try {
      // Upload pending attachments first
      let attachmentUrls: string[] = [];
      if (type === PostType.Post && (pendingFiles.length > 0 || uploadedUrls.length > 0)) {
        attachmentUrls = await uploadAll();
      }

      const request: PostCreateRequest = {
        classId,
        type,
        content: data.content,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
        linkedResources:
          type === PostType.Post && linkedResources.length > 0
            ? linkedResources.map((r) => ({
                type: r.type,
                id: r.id,
                permissionLevel: r.permissionLevel || 'view',
              }))
            : undefined,
        assignmentId: type === PostType.Exercise && selectedAssignment ? selectedAssignment.id : undefined,
        dueDate: type === PostType.Exercise && dueDate ? dueDate.toISOString() : undefined,
        allowComments,
        // Include assignment settings for Exercise type
        ...(type === PostType.Exercise && {
          maxSubmissions,
          allowRetake,
          shuffleQuestions,
          showCorrectAnswers,
          showScoreImmediately,
          passingScore,
          availableFrom: availableFrom || undefined,
          availableUntil: availableUntil || undefined,
        }),
      };

      await createPost.mutateAsync(request);

      // Reset form and UI
      editor.replaceBlocks(editor.document, []);
      form.reset({ content: '' });
      clearAttachments();
      setLinkedResources([]);
      setSelectedAssignment(null);
      setDueDate(undefined);
      setType(initialType);
      setAllowComments(true);
      // Reset assignment settings
      setMaxSubmissions(undefined);
      setAllowRetake(true);
      setShuffleQuestions(false);
      setShowCorrectAnswers(false);
      setShowScoreImmediately(true);
      setPassingScore(undefined);
      setAvailableFrom('');
      setAvailableUntil('');
      setOpen(false);

      onPostCreated?.();
    } catch (err) {
      // Error is handled by the hook
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const results = addFiles(files);

    const newErrors: string[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (!r.valid) {
        if (r.errorType === 'invalid_extension') {
          newErrors.push(
            // @ts-ignore - errorData.extension exists
            t('feed.creator.attachments.validation.invalidFileType', { extension: r.errorData?.extension })
          );
        } else if (r.errorType === 'file_too_large') {
          newErrors.push(
            t('feed.creator.attachments.validation.fileTooLarge', {
              fileName: files[i].name,
              maxSize: r.errorData?.maxSizeMB,
              actualSize: r.errorData?.actualSizeMB,
            })
          );
        } else if (r.errorType === 'max_attachments') {
          newErrors.push(t('feed.creator.validation.maxAttachmentsExceeded', { max: r.errorData?.max }));
        } else {
          newErrors.push(t('feed.creator.attachments.validation.cannotAdd', { fileName: files[i].name }));
        }
      }
    }

    setAttachmentErrors(newErrors);

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const canSubmit = !createPost.isPending && !isUploading;
  const buttonText =
    initialType === PostType.Exercise
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

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Post Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.creator.labels.postType')}</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as PostType)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={PostType.Post} id="post" />
                <Label htmlFor="post" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.post')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={PostType.Exercise} id="exercise" />
                <Label htmlFor="exercise" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.exercise')}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
          {/* Content Editor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('feed.creator.labels.content')}</Label>
            <div
              className={`rounded-lg border ${errors.content ? 'border-red-500 ring-2 ring-red-200' : ''}`}
            >
              <RichTextEditor
                editor={editor}
                minimalToolbar={true}
                sideMenu={false}
                className="min-h-[150px] p-2 md:min-h-[200px] md:p-3"
                onChange={handleEditorChange}
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-600">
                {t(((errors.content.message as string) ?? 'feed.creator.validation.contentRequired') as any)}
              </p>
            )}
          </div>
          <Separator />
          {/* Conditional Fields based on Post Type */}
          {type === PostType.Exercise ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('feed.creator.labels.selectAssignment')}</Label>
                <AssignmentListCommand
                  classId={classId}
                  onAssignmentSelect={(assignment) => setSelectedAssignment(assignment)}
                />
              </div>

              {selectedAssignment && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('feed.creator.labels.deadline')}</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dueDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate
                          ? format(dueDate, 'PPPP', { locale: getLocaleDateFns() })
                          : t('feed.creator.labels.deadline')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        disabled={(date: Date) => date < new Date()}
                        locale={getLocaleDateFns()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Assignment Settings */}
              {selectedAssignment && (
                <div className="space-y-4 rounded-lg border p-4">
                  <h4 className="text-sm font-semibold">{t('feed.creator.assignmentSettings.title')}</h4>

                  {/* Display Settings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="shuffle" className="text-sm">
                          {t('feed.creator.assignmentSettings.displaySettings.shuffleQuestions')}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {t('feed.creator.assignmentSettings.displaySettings.shuffleQuestionsDescription')}
                        </p>
                      </div>
                      <Switch id="shuffle" checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="showAnswers" className="text-sm">
                          {t('feed.creator.assignmentSettings.displaySettings.showCorrectAnswers')}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {t('feed.creator.assignmentSettings.displaySettings.showCorrectAnswersDescription')}
                        </p>
                      </div>
                      <Switch
                        id="showAnswers"
                        checked={showCorrectAnswers}
                        onCheckedChange={setShowCorrectAnswers}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="showScore" className="text-sm">
                          {t('feed.creator.assignmentSettings.displaySettings.showScoreImmediately')}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {t(
                            'feed.creator.assignmentSettings.displaySettings.showScoreImmediatelyDescription'
                          )}
                        </p>
                      </div>
                      <Switch
                        id="showScore"
                        checked={showScoreImmediately}
                        onCheckedChange={setShowScoreImmediately}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Submission Settings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="allowRetake" className="text-sm">
                          {t('feed.creator.assignmentSettings.submissionSettings.allowRetakes')}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {t('feed.creator.assignmentSettings.submissionSettings.allowRetakesDescription')}
                        </p>
                      </div>
                      <Switch id="allowRetake" checked={allowRetake} onCheckedChange={setAllowRetake} />
                    </div>

                    {allowRetake && (
                      <div>
                        <Label htmlFor="maxSub" className="text-xs text-gray-600">
                          {t('feed.creator.assignmentSettings.submissionSettings.maxSubmissions')}
                        </Label>
                        <Input
                          id="maxSub"
                          type="number"
                          min="1"
                          value={maxSubmissions || ''}
                          onChange={(e) =>
                            setMaxSubmissions(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          placeholder={t(
                            'feed.creator.assignmentSettings.submissionSettings.maxSubmissionsPlaceholder'
                          )}
                          className="mt-1 h-8"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {t('feed.creator.assignmentSettings.submissionSettings.maxSubmissionsDescription')}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Grading and Timing */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="passingScore" className="text-xs text-gray-600">
                        {t('feed.creator.assignmentSettings.grading.passingScore')}
                      </Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={passingScore || ''}
                        onChange={(e) =>
                          setPassingScore(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        placeholder={t('feed.creator.assignmentSettings.grading.passingScorePlaceholder')}
                        className="mt-1 h-8"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('feed.creator.assignmentSettings.grading.passingScoreDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="availFrom" className="text-xs text-gray-600">
                        {t('feed.creator.assignmentSettings.timing.availableFrom')}
                      </Label>
                      <Input
                        id="availFrom"
                        type="datetime-local"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="mt-1 h-8"
                      />
                    </div>

                    <div>
                      <Label htmlFor="availUntil" className="text-xs text-gray-600">
                        {t('feed.creator.assignmentSettings.timing.availableUntil')}
                      </Label>
                      <Input
                        id="availUntil"
                        type="datetime-local"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Attachments - Only for Post type */}
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

                  {/* Attachment validation errors */}
                  {attachmentErrors.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-red-600">
                      {attachmentErrors.map((err, idx) => (
                        <p key={idx}>{err}</p>
                      ))}
                    </div>
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
                  className={cn(
                    'w-full justify-start gap-2',
                    linkedResources.length > 0 && 'border-primary/50'
                  )}
                >
                  <Link2 className="h-4 w-4" />
                  <span className="flex-1 text-left">
                    {linkedResources.length > 0
                      ? t('feed.creator.resourcesSelected', { count: linkedResources.length })
                      : t('feed.creator.selectResources')}
                  </span>
                  {linkedResources.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {linkedResources.length}
                    </Badge>
                  )}
                </Button>

                {/* Selected resources chips */}
                {linkedResources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {linkedResources.map((resource) => {
                      const Icon =
                        resource.type === 'mindmap'
                          ? BrainCircuit
                          : resource.type === 'presentation'
                            ? Presentation
                            : ClipboardList;
                      const PermissionIcon = resource.permissionLevel === 'comment' ? MessageSquare : Eye;
                      return (
                        <Badge
                          key={`${resource.type}:${resource.id}`}
                          variant="secondary"
                          className="group flex items-center gap-2 py-1.5 pl-2.5 pr-2"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="max-w-[120px] truncate font-medium">{resource.title}</span>
                          <div className="flex items-center gap-1.5 border-l border-current border-opacity-20 pl-1.5">
                            <PermissionIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10 hover:text-destructive -mr-0.5 h-5 w-5 opacity-60 hover:opacity-100"
                              onClick={() =>
                                setLinkedResources((prev) =>
                                  prev.filter((r) => !(r.type === resource.type && r.id === resource.id))
                                )
                              }
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Badge>
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
