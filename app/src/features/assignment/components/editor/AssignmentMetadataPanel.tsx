import { useTranslation } from 'react-i18next';
import { FileText, HelpCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

export const AssignmentMetadataPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadata' });

  // Get data and actions from store - Basic Info
  const title = useAssignmentFormStore((state) => state.title);
  const description = useAssignmentFormStore((state) => state.description);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const setTitle = useAssignmentFormStore((state) => state.setTitle);
  const setDescription = useAssignmentFormStore((state) => state.setDescription);
  const setSubject = useAssignmentFormStore((state) => state.setSubject);
  const setGrade = useAssignmentFormStore((state) => state.setGrade);

  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <div className="flex items-center gap-3 border-b pb-4">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>
        </div>

      <div className="space-y-4 px-2">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Label htmlFor="title" className="text-xs text-gray-600 dark:text-gray-400">
              {t('fields.title')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t('tooltips.title')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm"
            placeholder={t('fields.titlePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Label htmlFor="subject" className="text-xs text-gray-600 dark:text-gray-400">
                {t('fields.subject')}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{t('tooltips.subject')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject" className="h-9 text-sm">
                <SelectValue placeholder={t('fields.subjectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.code} value={subj.code}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Label htmlFor="grade" className="text-xs text-gray-600 dark:text-gray-400">
                {t('fields.grade')}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{t('tooltips.grade')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade" className="h-9 text-sm">
                <SelectValue placeholder={t('fields.gradePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g.code} value={g.code}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Label htmlFor="description" className="text-xs text-gray-600 dark:text-gray-400">
              {t('fields.description')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t('tooltips.description')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm"
            rows={4}
            placeholder={t('fields.descriptionPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Switch id="shuffle" checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
          <Label
            htmlFor="shuffle"
            className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300"
          >
            {t('fields.shuffleQuestions')}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t('tooltips.shuffleQuestions')}</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
      </div>
    </div>
  );
};
