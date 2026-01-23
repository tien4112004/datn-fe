import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Filter, ChevronDown, Search } from 'lucide-react';
import type { QuestionBankParams } from '@/types/questionBank';
import { useQuestionBankSubjects, useQuestionBankGrades, useQuestionBankChapters } from '@/hooks/useApi';
import { getSubjectName, getAllQuestionTypes, getAllDifficulties } from '@aiprimary/core';

interface QuestionBankFiltersProps {
  filters: QuestionBankParams;
  onChange: (filters: QuestionBankParams) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  RightComponent?: React.ReactNode;
}

export function QuestionBankFilters({
  filters,
  onChange,
  searchQuery = '',
  onSearchChange,
  orientation = 'horizontal',
  RightComponent,
}: QuestionBankFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Fetch metadata
  const { data: subjectsData } = useQuestionBankSubjects();
  const { data: gradesData } = useQuestionBankGrades();

  // Conditional chapter fetch
  const shouldFetchChapters = useMemo(() => {
    const subjects = Array.isArray(filters.subject) ? filters.subject : [];
    const grades = Array.isArray(filters.grade) ? filters.grade : [];
    return subjects.length === 1 && grades.length === 1;
  }, [filters.subject, filters.grade]);

  const { data: chaptersData } = useQuestionBankChapters(
    shouldFetchChapters && Array.isArray(filters.subject) ? filters.subject[0] : undefined,
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
    (Array.isArray(filters.subject) && filters.subject.length > 0) ||
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

  // Horizontal layout with search bar and collapsible filters
  if (orientation === 'horizontal') {
    return (
      <div className="space-y-4">
        {/* Search Bar with Toggle Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="h-10 w-10 shrink-0"
            title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
          >
            <div className="flex items-center gap-1">
              <Filter className="h-5 w-5" />
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </Button>
          <div className="flex flex-1 gap-2">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9"
              />
            </div>

            {RightComponent}
          </div>
        </div>

        {/* Filters Grid - Collapsible with CSS transitions */}
        <div
          className={`grid gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
            isFiltersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0">
            <div
              className={`grid gap-4 ${shouldFetchChapters && chapters.length > 0 ? 'grid-cols-[1fr_1fr_1fr_1fr_2fr]' : 'grid-cols-4'}`}
            >
              {/* Question Type - Multi-select */}
              <div className="space-y-2">
                <Label className="text-foreground mb-3 block text-sm font-semibold">Question Type</Label>
                <div className="space-y-2">
                  {getAllQuestionTypes({ includeGroup: true }).map((type) => (
                    <label
                      key={type.value}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={
                          Array.isArray(filters.questionType) && filters.questionType.includes(type.value)
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('questionType', type.value, checked as boolean)
                        }
                      />
                      <span className="text-xs font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty - Multi-select */}
              <div className="space-y-2">
                <Label className="text-foreground mb-3 block text-sm font-semibold">Difficulty</Label>
                <div className="space-y-2">
                  {getAllDifficulties().map((difficulty) => (
                    <label
                      key={difficulty.value}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={
                          Array.isArray(filters.difficulty) && filters.difficulty.includes(difficulty.value)
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('difficulty', difficulty.value, checked as boolean)
                        }
                      />
                      <span className="text-xs font-medium">{difficulty.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject - Multi-select */}
              <div className="space-y-2">
                <Label className="text-foreground mb-3 block text-sm font-semibold">Subject</Label>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {subjects.map((subject) => (
                    <label
                      key={subject}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={Array.isArray(filters.subject) && filters.subject.includes(subject as any)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('subject', subject, checked as boolean)
                        }
                      />
                      <span className="text-xs font-medium">{getSubjectName(subject)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Grade - Multi-select */}
              <div className="space-y-2">
                <Label className="text-foreground mb-3 block text-sm font-semibold">Grade</Label>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {grades.map((grade) => (
                    <label
                      key={grade}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={Array.isArray(filters.grade) && filters.grade.includes(grade)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('grade', grade, checked as boolean)
                        }
                      />
                      <span className="text-xs font-medium">Grade {grade}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chapter - Multi-select (conditional) */}
              {shouldFetchChapters && chapters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground mb-3 block text-sm font-semibold">Chapter</Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                      >
                        <Checkbox
                          checked={Array.isArray(filters.chapter) && filters.chapter.includes(chapter.name)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('chapter', chapter.name, checked as boolean)
                          }
                        />
                        <span className="max-w-full truncate text-xs font-medium" title={chapter.name}>
                          {chapter.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full gap-2 font-semibold"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  // Vertical layout (original)
  return (
    <div className="space-y-4">
      {/* Question Type */}
      <div>
        <Label className="text-sm font-medium">Question Type</Label>
        <div className="mt-2 space-y-2">
          {getAllQuestionTypes({ includeGroup: true }).map((type) => (
            <label key={type.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.questionType) && filters.questionType.includes(type.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('questionType', type.value, checked as boolean)
                }
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-sm font-medium">Difficulty</Label>
        <div className="mt-2 space-y-2">
          {getAllDifficulties().map((difficulty) => (
            <label key={difficulty.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(difficulty.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('difficulty', difficulty.value, checked as boolean)
                }
              />
              <span className="text-sm">{difficulty.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label className="text-sm font-medium">Subject</Label>
        <div className="mt-2 space-y-2">
          {subjects.map((subject) => (
            <label key={subject} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.subject) && filters.subject.includes(subject as any)}
                onCheckedChange={(checked) => handleCheckboxChange('subject', subject, checked as boolean)}
              />
              <span className="text-sm">{getSubjectName(subject)}</span>
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
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <Label className="text-sm font-medium">Chapter (for selected Subject + Grade)</Label>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {chapters.map((chapter) => (
              <label key={chapter.id} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={Array.isArray(filters.chapter) && filters.chapter.includes(chapter.name)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('chapter', chapter.name, checked as boolean)
                  }
                />
                <span className="text-sm">{chapter.name}</span>
              </label>
            ))}
          </div>
        </div>
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
