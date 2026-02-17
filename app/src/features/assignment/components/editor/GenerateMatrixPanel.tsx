import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useGenerateMatrix } from '@/features/assignment/hooks/useAssignmentApi';
import { useModels, MODEL_TYPES } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import type { GenerateMatrixRequest, GenerateMatrixResponse } from '@/features/assignment/types/assignment';
import { Wand2, Loader2, Zap, BookOpen, GraduationCap, X, Plus, Check, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  getElementaryGrades,
  getAllSubjects,
  getAllQuestionTypes,
  getAllDifficulties,
} from '@aiprimary/core';

const MATRIX_PRESETS = [
  {
    key: 'quickQuiz' as const,
    icon: Zap,
    totalQuestions: 10,
    totalPoints: 10,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION'],
    questionTypes: ['MULTIPLE_CHOICE'],
  },
  {
    key: 'standardTest' as const,
    icon: BookOpen,
    totalQuestions: 20,
    totalPoints: 100,
    difficulties: null,
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_BLANK'],
  },
  {
    key: 'comprehensiveExam' as const,
    icon: GraduationCap,
    totalQuestions: 40,
    totalPoints: 100,
    difficulties: null, // all
    questionTypes: null, // all
  },
] as const;

interface GenerateMatrixPanelProps {
  onClose?: () => void;
  onGenerated: (response: GenerateMatrixResponse) => void;
  initialGrade?: string;
  initialSubject?: string;
  initialName?: string;
}

interface ModelValue {
  name: string;
  provider: string;
}

export function GenerateMatrixPanel({
  onClose,
  onGenerated,
  initialGrade,
  initialSubject,
  initialName,
}: GenerateMatrixPanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.generateMatrixDialog',
  });

  // Form state
  const [grade, setGrade] = useState(initialGrade || '');
  const [subject, setSubject] = useState(initialSubject || '');
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [totalPoints, setTotalPoints] = useState(100);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(() =>
    getAllDifficulties().map((d) => d.value)
  );
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(() =>
    getAllQuestionTypes().map((qt) => qt.value)
  );
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [selectedModel, setSelectedModel] = useState<ModelValue | undefined>();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const generateMutation = useGenerateMatrix();
  const {
    models,
    defaultModel,
    isLoading: isLoadingModels,
    isError: isErrorModels,
  } = useModels(MODEL_TYPES.TEXT);

  // Auto-select default model when models load
  useEffect(() => {
    if (defaultModel && !selectedModel) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel]);

  // Get data from core constants
  const grades = getElementaryGrades();
  const subjects = getAllSubjects();
  const questionTypes = getAllQuestionTypes();
  const difficulties = getAllDifficulties();

  const handleDifficultyToggle = (value: string) => {
    setActivePreset(null);
    setSelectedDifficulties((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleQuestionTypeToggle = (value: string) => {
    setActivePreset(null);
    setSelectedQuestionTypes((prev) =>
      prev.includes(value) ? prev.filter((qt) => qt !== value) : [...prev, value]
    );
  };

  const handlePresetClick = (preset: (typeof MATRIX_PRESETS)[number]) => {
    setActivePreset(preset.key);
    setTotalQuestions(preset.totalQuestions);
    setTotalPoints(preset.totalPoints);
    setSelectedDifficulties(
      preset.difficulties ? [...preset.difficulties] : getAllDifficulties().map((d) => d.value)
    );
    setSelectedQuestionTypes(
      preset.questionTypes ? [...preset.questionTypes] : getAllQuestionTypes().map((qt) => qt.value)
    );
  };

  const handleGenerate = async () => {
    if (!grade) {
      toast.error(t('validation.gradeRequired'));
      return;
    }
    if (!subject) {
      toast.error(t('validation.subjectRequired'));
      return;
    }
    if (totalQuestions < 1) {
      toast.error(t('validation.totalQuestionsRequired'));
      return;
    }
    if (totalPoints < 1) {
      toast.error(t('validation.totalPointsRequired'));
      return;
    }
    if (selectedDifficulties.length === 0) {
      toast.error(t('toast.noDifficulties'));
      return;
    }
    if (selectedQuestionTypes.length === 0) {
      toast.error(t('toast.noQuestionTypes'));
      return;
    }

    const request: GenerateMatrixRequest = {
      name: initialName?.trim() || '',
      grade,
      subject,
      totalQuestions,
      totalPoints,
      difficulties: selectedDifficulties,
      questionTypes: selectedQuestionTypes,
      ...(prompt.trim() && { prompt: prompt.trim() }),
      language,
      ...(selectedModel && { provider: selectedModel.provider, model: selectedModel.name }),
    };

    try {
      const result = await generateMutation.mutateAsync(request);
      onGenerated(result);
    } catch {
      toast.error(t('toast.error'));
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl space-y-6 px-2">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('presets.label')}</Label>
            <div className="grid grid-cols-3 gap-3">
              {MATRIX_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`hover:bg-muted/50 flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors ${
                      activePreset === preset.key ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{t(`presets.${preset.key}.label`)}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {t(`presets.${preset.key}.description`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="matrix-prompt">{t('fields.prompt')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>{t('fields.promptHelp')}</TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="matrix-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('fields.promptPlaceholder')}
              className="min-h-20 resize-none"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{t('fields.language')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>{t('fields.languageHelp')}</TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup value={language} onValueChange={(value) => setLanguage(value as 'vi' | 'en')}>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vi" id="lang-vi" />
                  <Label htmlFor="lang-vi" className="cursor-pointer font-normal">
                    {t('fields.languageVietnamese')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer font-normal">
                    {t('fields.languageEnglish')}
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Grade and Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matrix-grade">
                {t('fields.grade')} <span className="text-red-500">*</span>
              </Label>
              <Select value={grade} onValueChange={setGrade} disabled={!!initialGrade}>
                <SelectTrigger className="w-full">
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
              <Label htmlFor="matrix-subject">
                {t('fields.subject')} <span className="text-red-500">*</span>
              </Label>
              <Select value={subject} onValueChange={setSubject} disabled={!!initialSubject}>
                <SelectTrigger className="w-full">
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

          {/* Total Questions and Total Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matrix-total-questions">
                {t('fields.totalQuestions')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="matrix-total-questions"
                type="number"
                min={1}
                value={totalQuestions}
                onChange={(e) => {
                  setActivePreset(null);
                  setTotalQuestions(Math.max(1, parseInt(e.target.value, 10) || 1));
                }}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matrix-total-points">
                {t('fields.totalPoints')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="matrix-total-points"
                type="number"
                min={1}
                value={totalPoints}
                onChange={(e) => {
                  setActivePreset(null);
                  setTotalPoints(Math.max(1, parseInt(e.target.value, 10) || 1));
                }}
                className="h-9"
              />
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {t('fields.difficulties')} <span className="text-red-500">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>{t('fields.difficultiesHelp')}</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleDifficultyToggle(d.value)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    selectedDifficulties.includes(d.value)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {selectedDifficulties.includes(d.value) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {t('fields.questionTypes')} <span className="text-red-500">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>{t('fields.questionTypesHelp')}</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((qt) => (
                <button
                  key={qt.value}
                  type="button"
                  onClick={() => handleQuestionTypeToggle(qt.value)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    selectedQuestionTypes.includes(qt.value)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {selectedQuestionTypes.includes(qt.value) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <Label>{t('fields.model')}</Label>
            <ModelSelect
              models={models}
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as ModelValue)}
              placeholder={t('fields.modelPlaceholder')}
              isLoading={isLoadingModels}
              isError={isErrorModels}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-2 pt-4">
          <div className="flex justify-end gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('actions.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {t('actions.generate')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
