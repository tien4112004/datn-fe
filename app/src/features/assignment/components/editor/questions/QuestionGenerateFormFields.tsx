import { NumberInput } from '@ui/number-input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Textarea } from '@ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { AlertCircle, Check, Info, Plus } from 'lucide-react';
import type { useQuestionGenerateForm, ModelValue } from './useQuestionGenerateForm';

type FormState = ReturnType<typeof useQuestionGenerateForm>;

interface QuestionGenerateFormFieldsProps extends FormState {
  /** When true, the grade selector is disabled. */
  initialGrade?: string;
  /** When true, the subject selector is disabled. */
  initialSubject?: string;
}

export function QuestionGenerateFormFields({
  prompt,
  setPrompt,
  grade,
  subject,
  chapter,
  setChapter,
  selectedTypes,
  questionsPerDifficulty,
  selectedModel,
  setSelectedModel,
  validationErrors,
  handleTypeToggle,
  handleDifficultyChange,
  handleSubjectChange,
  handleGradeChange,
  clearValidationError,
  getTotalQuestions,
  grades,
  subjects,
  questionTypes,
  difficulties,
  chapters,
  models,
  isLoadingModels,
  isErrorModels,
  initialGrade,
  initialSubject,
}: QuestionGenerateFormFieldsProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'teacherQuestionBank.generate',
  });

  const total = getTotalQuestions();

  return (
    <>
      {/* Prompt */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="prompt">{t('fields.prompt')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('tooltips.prompt')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (validationErrors.prompt) clearValidationError('prompt');
          }}
          placeholder={t('fields.promptPlaceholder')}
          className={`min-h-20 resize-none ${validationErrors.prompt ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{t('fields.promptHelp')}</p>
          <p className="text-muted-foreground text-xs">{prompt.length} / 1000</p>
        </div>
      </div>

      {/* Grade and Subject */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">
            {t('fields.grade')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={grade}
            onValueChange={(value) => {
              handleGradeChange(value);
              if (validationErrors.grade) clearValidationError('grade');
            }}
            disabled={!!initialGrade}
          >
            <SelectTrigger className={`w-full ${validationErrors.grade ? 'border-red-500' : ''}`}>
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

        <div className="space-y-2">
          <Label htmlFor="subject">
            {t('fields.subject')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={subject}
            onValueChange={(value) => {
              handleSubjectChange(value);
              if (validationErrors.subject) clearValidationError('subject');
            }}
            disabled={!!initialSubject}
          >
            <SelectTrigger className={`w-full ${validationErrors.subject ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={t('fields.subjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chapter – optional, only shown when chapters are available */}
      {chapters && chapters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="chapter">{t('fields.chapter')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t('tooltips.chapter')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={chapter} onValueChange={setChapter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('fields.chapterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((ch) => (
                <SelectItem key={ch.id} value={ch.name}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{t('fields.chapterHelp')}</p>
        </div>
      )}

      {/* Question Types */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>
            {t('fields.questionTypes')} <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('tooltips.questionTypes')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div
          className={`flex flex-wrap gap-2 rounded-md p-1 ${validationErrors.questionTypes ? 'ring-2 ring-red-500' : ''}`}
        >
          {questionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                handleTypeToggle(type.value);
                if (validationErrors.questionTypes) clearValidationError('questionTypes');
              }}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                selectedTypes.includes(type.value)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {selectedTypes.includes(type.value) ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {type.label}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{t('fields.questionTypesHelp')}</p>
      </div>

      {/* Questions per Difficulty */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>{t('fields.questionsPerDifficulty')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('tooltips.questionsPerDifficulty')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div
          className={`grid grid-cols-3 gap-4 ${validationErrors.difficulty ? 'rounded-md border-2 border-red-500 p-2' : ''}`}
        >
          {difficulties.map((difficulty) => (
            <div key={difficulty.value} className="space-y-1">
              <label htmlFor={`difficulty-${difficulty.value}`} className="text-muted-foreground text-xs">
                {difficulty.label}
              </label>
              <NumberInput
                id={`difficulty-${difficulty.value}`}
                min={0}
                max={50}
                value={questionsPerDifficulty[difficulty.value] || 0}
                onValueChange={(val: number | undefined) => {
                  handleDifficultyChange(difficulty.value, String(val ?? 0));
                  if (validationErrors.difficulty) clearValidationError('difficulty');
                }}
                stepper={1}
                className="h-9"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {t('fields.total')}{' '}
            <span
              className={`font-semibold ${total === 0 ? 'text-red-500' : total > 10 ? 'text-orange-500' : 'text-green-600'}`}
            >
              {total}
            </span>{' '}
            {total === 1 ? t('fields.questionSingular') : t('fields.questionPlural')}
          </p>
          {total > 10 && (
            <p className="flex items-center gap-1 text-xs text-orange-500">
              <AlertCircle className="h-3 w-3" />
              {t('fields.largeGenerationWarning')}
            </p>
          )}
        </div>
      </div>

      {/* AI Model */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>{t('fields.model')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('tooltips.model')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ModelSelect
          models={models}
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value as ModelValue)}
          placeholder={t('fields.modelPlaceholder')}
          className="w-full"
          isLoading={isLoadingModels}
          isError={isErrorModels}
        />
      </div>
    </>
  );
}
