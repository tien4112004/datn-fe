import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { QuestionBankParams } from '@/types/question-bank';
import { QUESTION_TYPE, DIFFICULTY } from '@/types/question-bank';
import { useQuestionBankSubjects, useQuestionBankGrades, useQuestionBankChapters } from '@/hooks/useApi';
import { useMemo, useEffect } from 'react';

interface QuestionBankFiltersProps {
  filters: QuestionBankParams;
  onChange: (filters: QuestionBankParams) => void;
}

export function QuestionBankFilters({ filters, onChange }: QuestionBankFiltersProps) {
  // Fetch metadata
  const { data: subjectsData } = useQuestionBankSubjects();
  const { data: gradesData } = useQuestionBankGrades();

  // Conditional chapter fetch
  const shouldFetchChapters = useMemo(() => {
    const subjects = Array.isArray(filters.subjectCode) ? filters.subjectCode : [];
    const grades = Array.isArray(filters.grade) ? filters.grade : [];
    return subjects.length === 1 && grades.length === 1;
  }, [filters.subjectCode, filters.grade]);

  const { data: chaptersData } = useQuestionBankChapters(
    shouldFetchChapters && Array.isArray(filters.subjectCode) ? filters.subjectCode[0] : undefined,
    shouldFetchChapters && Array.isArray(filters.grade) ? filters.grade[0] : undefined
  );

  const subjects = subjectsData?.data || [];
  const grades = gradesData?.data || [];
  const chapters = chaptersData?.data || [];

  // Reset chapter filter when subject/grade changes
  useEffect(() => {
    if (!shouldFetchChapters && filters.chapter) {
      onChange({ ...filters, chapter: undefined });
    }
  }, [shouldFetchChapters]);

  const hasActiveFilters =
    (Array.isArray(filters.questionType) && filters.questionType.length > 0) ||
    (Array.isArray(filters.difficulty) && filters.difficulty.length > 0) ||
    (Array.isArray(filters.subjectCode) && filters.subjectCode.length > 0) ||
    (Array.isArray(filters.grade) && filters.grade.length > 0) ||
    (Array.isArray(filters.chapter) && filters.chapter.length > 0);

  const handleCheckboxChange = (filterKey: keyof QuestionBankParams, value: string, checked: boolean) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);

    onChange({ ...filters, [filterKey]: newValues.length ? newValues : undefined });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  return (
    <div className="space-y-4">
      {/* Question Type */}
      <div>
        <Label className="text-sm font-medium">Question Type</Label>
        <div className="mt-2 space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                Array.isArray(filters.questionType) &&
                filters.questionType.includes(QUESTION_TYPE.MULTIPLE_CHOICE)
              }
              onCheckedChange={(checked) =>
                handleCheckboxChange('questionType', QUESTION_TYPE.MULTIPLE_CHOICE, checked as boolean)
              }
            />
            <span className="text-sm">Multiple Choice</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                Array.isArray(filters.questionType) && filters.questionType.includes(QUESTION_TYPE.MATCHING)
              }
              onCheckedChange={(checked) =>
                handleCheckboxChange('questionType', QUESTION_TYPE.MATCHING, checked as boolean)
              }
            />
            <span className="text-sm">Matching</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                Array.isArray(filters.questionType) && filters.questionType.includes(QUESTION_TYPE.OPEN_ENDED)
              }
              onCheckedChange={(checked) =>
                handleCheckboxChange('questionType', QUESTION_TYPE.OPEN_ENDED, checked as boolean)
              }
            />
            <span className="text-sm">Open-ended</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                Array.isArray(filters.questionType) &&
                filters.questionType.includes(QUESTION_TYPE.FILL_IN_BLANK)
              }
              onCheckedChange={(checked) =>
                handleCheckboxChange('questionType', QUESTION_TYPE.FILL_IN_BLANK, checked as boolean)
              }
            />
            <span className="text-sm">Fill In Blank</span>
          </label>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-sm font-medium">Difficulty</Label>
        <div className="mt-2 space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(DIFFICULTY.EASY)}
              onCheckedChange={(checked) =>
                handleCheckboxChange('difficulty', DIFFICULTY.EASY, checked as boolean)
              }
            />
            <span className="text-sm">Nhận biết (Knowledge)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(DIFFICULTY.MEDIUM)}
              onCheckedChange={(checked) =>
                handleCheckboxChange('difficulty', DIFFICULTY.MEDIUM, checked as boolean)
              }
            />
            <span className="text-sm">Thông hiểu (Comprehension)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(DIFFICULTY.HARD)}
              onCheckedChange={(checked) =>
                handleCheckboxChange('difficulty', DIFFICULTY.HARD, checked as boolean)
              }
            />
            <span className="text-sm">Vận dụng (Application)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                Array.isArray(filters.difficulty) && filters.difficulty.includes(DIFFICULTY.SUPER_HARD)
              }
              onCheckedChange={(checked) =>
                handleCheckboxChange('difficulty', DIFFICULTY.SUPER_HARD, checked as boolean)
              }
            />
            <span className="text-sm">Vận dụng cao (Advanced)</span>
          </label>
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label className="text-sm font-medium">Subject</Label>
        <div className="mt-2 space-y-2">
          {subjects.map((subject) => (
            <label key={subject} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.subjectCode) && filters.subjectCode.includes(subject as any)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('subjectCode', subject, checked as boolean)
                }
              />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <Label className="text-sm font-medium">Grade</Label>
        <div className="mt-2 space-y-2">
          {grades.map((grade) => (
            <label key={grade} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.grade) && filters.grade.includes(grade)}
                onCheckedChange={(checked) => handleCheckboxChange('grade', grade, checked as boolean)}
              />
              <span className="text-sm">Grade {grade}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Conditional Chapter */}
      {shouldFetchChapters && chapters.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <Label className="text-sm font-medium">Chapter (for selected Subject + Grade)</Label>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {chapters.map((chapter) => (
              <label key={chapter} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={Array.isArray(filters.chapter) && filters.chapter.includes(chapter)}
                  onCheckedChange={(checked) => handleCheckboxChange('chapter', chapter, checked as boolean)}
                />
                <span className="text-sm">{chapter}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {shouldFetchChapters && chapters.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          No chapters available for selected subject and grade.
        </p>
      )}

      {!shouldFetchChapters && (
        <p className="text-muted-foreground text-sm italic">
          Select exactly 1 subject and 1 grade to see chapter options.
        </p>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="w-full gap-2">
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
