import React, { useState, useEffect } from 'react';
import { useCreatePost } from '../hooks/useApi';
import { useAttachmentUpload } from '../hooks/useAttachmentUpload';
import type { PostCreateRequest } from '../types';
import type { LinkedResource } from '@/features/projects/types/resource';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
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
import {
  Paperclip,
  Plus,
  X,
  Link2,
  BrainCircuit,
  Presentation,
  ClipboardList,
  Loader2,
  Eye,
  MessageSquare,
  Calendar,
  CalendarIcon,
} from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import { ResourceSelectorDialog } from '@/features/projects/components/resource-selector';
import { getAcceptString, formatFileSize } from '../utils/attachmentValidation';
import { Progress } from '@/shared/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { cn } from '@/shared/lib/utils';
import { AssignmentListCommand } from './AssignmentListCommand';
import { format } from 'date-fns/format';

interface Assignment {
  id: string;
  title: string;
}

interface PostCreatorProps {
  classId: string;
  onPostCreated?: () => void;
  className?: string;
  initialType?: 'Post' | 'Exercise';
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
  const [type, setType] = useState<'Post' | 'Exercise'>(initialType);
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

  // Sync type with initialType when it changes (e.g., when filter switches to Exercise)
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

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
        linkedResources:
          type === 'Post' && linkedResources.length > 0
            ? linkedResources.map((r) => ({
                type: r.type,
                id: r.id,
                permissionLevel: r.permissionLevel || 'view',
              }))
            : undefined,
        assignmentId: type === 'Exercise' && selectedAssignment ? selectedAssignment.id : undefined,
        dueDate: type === 'Exercise' && dueDate ? dueDate.toISOString() : undefined,
        allowComments,
        // Include assignment settings for Exercise type
        ...(type === 'Exercise' && {
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

      // Reset form
      editor.replaceBlocks(editor.document, []);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const canSubmit = editor && editor.document.length > 0 && !createPost.isPending && !isUploading;

  const buttonText =
    initialType === 'Exercise'
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
              onValueChange={(value) => setType(value as 'Post' | 'Exercise')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Post" id="post" />
                <Label htmlFor="post" className="cursor-pointer font-normal">
                  {t('feed.creator.postType.post')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Exercise" id="exercise" />
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
          {type === 'Exercise' ? (
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
                      const PermissionIcon = resource.permissionLevel === 'comment' ? MessageSquare : Eye;
                      return (
                        <div
                          key={`${resource.type}:${resource.id}`}
                          className="bg-secondary flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="max-w-[120px] truncate">{resource.title}</span>
                          <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                            <PermissionIcon className="h-3 w-3" />
                          </span>
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
