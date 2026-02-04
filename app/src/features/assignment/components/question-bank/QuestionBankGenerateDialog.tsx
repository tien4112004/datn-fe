import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  useGenerateQuestions,
  useQuestionBankChapters,
} from '@/features/assignment/hooks/useQuestionBankApi';
import { useModels, MODEL_TYPES } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import type { GenerateQuestionsRequest } from '@/features/assignment/types/questionBank';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  getElementaryGrades,
  getAllSubjects,
  getAllQuestionTypes,
  getAllDifficulties,
  DIFFICULTY,
} from '@aiprimary/core';

interface QuestionBankGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModelValue {
  name: string;
  provider: string;
}

export function QuestionBankGenerateDialog({ open, onOpenChange }: QuestionBankGenerateDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'teacherQuestionBank.generate' });

  // Form state
  const [prompt, setPrompt] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MULTIPLE_CHOICE']);
  const [questionsPerDifficulty, setQuestionsPerDifficulty] = useState<Record<string, number>>({
    [DIFFICULTY.KNOWLEDGE]: 2,
    [DIFFICULTY.COMPREHENSION]: 2,
    [DIFFICULTY.APPLICATION]: 1,
  });
  const [selectedModel, setSelectedModel] = useState<ModelValue | undefined>();

  const generateMutation = useGenerateQuestions();
  const { models, isLoading: isLoadingModels, isError: isErrorModels } = useModels(MODEL_TYPES.TEXT);

  // Fetch chapters when both subject and grade are selected
  const { data: chapters } = useQuestionBankChapters(subject || undefined, grade || undefined);

  // Get data from core constants
  const grades = getElementaryGrades();
  const subjects = getAllSubjects();
  const questionTypes = getAllQuestionTypes();
  const difficulties = getAllDifficulties();

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleDifficultyChange = (difficulty: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setQuestionsPerDifficulty((prev) => ({
      ...prev,
      [difficulty]: Math.max(0, Math.min(10, numValue)),
    }));
  };

  const getTotalQuestions = () => {
    return Object.values(questionsPerDifficulty).reduce((sum, count) => sum + count, 0);
  };

  // Reset chapter when subject or grade changes
  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setChapter('');
  };

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setChapter('');
  };

  const handleGenerate = async () => {
    // Validation
    if (!prompt.trim()) {
      toast.error(t('validation.promptRequired'));
      return;
    }
    if (!grade) {
      toast.error(t('validation.gradeRequired'));
      return;
    }
    if (!subject) {
      toast.error(t('validation.subjectRequired'));
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error(t('toast.noQuestionTypes'));
      return;
    }
    if (getTotalQuestions() === 0) {
      toast.error(t('toast.noQuestionsRequested'));
      return;
    }

    // Build questionsPerDifficulty only with non-zero values
    const filteredDifficulties: Record<string, number> = {};
    for (const [key, value] of Object.entries(questionsPerDifficulty)) {
      if (value > 0) {
        filteredDifficulties[key] = value;
      }
    }

    const request: GenerateQuestionsRequest = {
      prompt: prompt.trim(),
      gradeLevel: grade,
      subject,
      questionTypes: selectedTypes,
      questionsPerDifficulty: filteredDifficulties,
      ...(chapter && { chapter }),
      ...(selectedModel && { provider: selectedModel.provider, model: selectedModel.name }),
    };

    try {
      const result = await generateMutation.mutateAsync(request);
      onOpenChange(false);
      resetForm();
      // Navigate to generated questions page with the results
      navigate('/question-bank/generated', {
        state: {
          questions: result.questions,
          totalGenerated: result.totalGenerated,
          generationParams: {
            prompt: prompt.trim(),
            grade,
            subject,
            ...(chapter && { chapter }),
          },
        },
      });
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const resetForm = () => {
    setPrompt('');
    setGrade('');
    setSubject('');
    setChapter('');
    setSelectedTypes(['MULTIPLE_CHOICE']);
    setQuestionsPerDifficulty({
      [DIFFICULTY.KNOWLEDGE]: 2,
      [DIFFICULTY.COMPREHENSION]: 2,
      [DIFFICULTY.APPLICATION]: 1,
    });
    setSelectedModel(undefined);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-3xl border-2 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">{t('fields.prompt')} *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('fields.promptPlaceholder')}
              className="min-h-20 resize-none"
            />
            <p className="text-muted-foreground text-xs">{t('fields.promptHelp')}</p>
          </div>

          {/* Grade and Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">{t('fields.grade')} *</Label>
              <Select value={grade} onValueChange={handleGradeChange}>
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
              <Label htmlFor="subject">{t('fields.subject')} *</Label>
              <Select value={subject} onValueChange={handleSubjectChange}>
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

          {/* Chapter - Optional (only shown when chapters are available) */}
          {chapters && chapters.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="chapter">{t('fields.chapter')}</Label>
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
            <Label>{t('fields.questionTypes')} *</Label>
            <div className="grid grid-cols-2 gap-3">
              {questionTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2 rounded-md border p-3">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={() => handleTypeToggle(type.value)}
                  />
                  <label
                    htmlFor={`type-${type.value}`}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">{t('fields.questionTypesHelp')}</p>
          </div>

          {/* Questions per Difficulty */}
          <div className="space-y-2">
            <Label>{t('fields.questionsPerDifficulty')}</Label>
            <div className="grid grid-cols-3 gap-4">
              {difficulties.map((difficulty) => (
                <div key={difficulty.value} className="space-y-1">
                  <label htmlFor={`difficulty-${difficulty.value}`} className="text-muted-foreground text-xs">
                    {difficulty.label}
                  </label>
                  <Input
                    id={`difficulty-${difficulty.value}`}
                    type="number"
                    min={0}
                    max={10}
                    value={questionsPerDifficulty[difficulty.value] || 0}
                    onChange={(e) => handleDifficultyChange(difficulty.value, e.target.value)}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">Total: {getTotalQuestions()} question(s)</p>
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <Label>{t('fields.model')}</Label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('actions.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('actions.generate')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
