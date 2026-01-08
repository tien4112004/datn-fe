import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { X, Filter } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import useQuestionBankStore from '../../stores/questionBankStore';
import {
  useQuestionBankSubjects,
  useQuestionBankGrades,
  useQuestionBankChapters,
} from '../../hooks/useQuestionBankApi';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

export const QuestionBankFilters = () => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, setFilters, clearFilters, hasActiveFilters, shouldShowChapterFilter } =
    useQuestionBankStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Fetch metadata
  const { data: subjects } = useQuestionBankSubjects();
  const { data: grades } = useQuestionBankGrades();

  // Conditional chapter fetch
  const showChapters = shouldShowChapterFilter();
  const subjectForChapters =
    Array.isArray(filters.subjectCode) && filters.subjectCode.length === 1
      ? filters.subjectCode[0]
      : undefined;
  const gradeForChapters =
    Array.isArray(filters.grade) && filters.grade.length === 1 ? filters.grade[0] : undefined;

  const { data: chapters } = useQuestionBankChapters(subjectForChapters, gradeForChapters);

  // Reset chapter filter when subject/grade changes
  useEffect(() => {
    if (!showChapters && filters.chapter) {
      setFilters({ chapter: undefined });
    }
  }, [showChapters]);

  const handleSearchChange = (value: string) => {
    setFilters({ searchText: value });
  };

  const handleCheckboxChange = (filterKey: keyof typeof filters, value: string, checked: boolean) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);

    setFilters({ [filterKey]: newValues.length ? newValues : undefined });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar with Toggle Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="h-10 w-10 shrink-0"
        >
          <Filter className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <SearchBar
            value={filters.searchText}
            onChange={handleSearchChange}
            placeholder={t('questionBank.filters.search')}
            debounceTime={300}
          />
        </div>
      </div>

      {/* Filters Grid - Collapsible */}
      {isFiltersOpen && (
        <div className="grid grid-flow-col gap-4">
          {/* Question Type - Multi-select */}
          <div className="flex justify-between">
            <div className="space-y-2">
              <Label className="text-foreground mb-3 block text-sm font-semibold">
                {t('questionBank.filters.type')}
              </Label>
              <div className="space-y-2">
                {[
                  { value: QUESTION_TYPE.MULTIPLE_CHOICE, label: t('questionTypes.multipleChoice') },
                  { value: QUESTION_TYPE.MATCHING, label: t('questionTypes.matching') },
                  { value: QUESTION_TYPE.OPEN_ENDED, label: t('questionTypes.openEnded') },
                  { value: QUESTION_TYPE.FILL_IN_BLANK, label: t('questionTypes.fillInBlank') },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={
                        Array.isArray(filters.questionType) && filters.questionType.includes(option.value)
                      }
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('questionType', option.value, checked as boolean)
                      }
                    />
                    <span className="text-xs font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" />
          </div>

          {/* Difficulty - Multi-select */}
          <div className="flex justify-between">
            <div className="space-y-2">
              <Label className="text-foreground mb-3 block text-sm font-semibold">
                {t('questionBank.filters.difficulty')}
              </Label>
              <div className="space-y-2">
                {[
                  { value: DIFFICULTY.EASY, label: t('difficulty.nhanBiet') },
                  { value: DIFFICULTY.MEDIUM, label: t('difficulty.thongHieu') },
                  { value: DIFFICULTY.HARD, label: t('difficulty.vanDung') },
                  { value: DIFFICULTY.SUPER_HARD, label: t('difficulty.vanDungCao') },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('difficulty', option.value, checked as boolean)
                      }
                    />
                    <span className="text-xs font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" />
          </div>

          {/* Subject - Multi-select */}
          <div className="flex justify-between">
            <div className="space-y-2">
              <Label className="text-foreground mb-3 block text-sm font-semibold">
                {t('questionBank.filters.subject')}
              </Label>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {subjects?.map((subject) => (
                  <label
                    key={subject}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={
                        Array.isArray(filters.subjectCode) && filters.subjectCode.includes(subject as any)
                      }
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('subjectCode', subject, checked as boolean)
                      }
                    />
                    <span className="text-xs font-medium">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" />
          </div>

          {/* Grade - Multi-select */}
          <div className="flex justify-between">
            <div className="flex-1 space-y-2">
              <Label className="text-foreground mb-3 block text-sm font-semibold">Grade</Label>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {grades?.map((grade) => (
                  <label
                    key={grade}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={Array.isArray(filters.grade) && filters.grade.includes(grade)}
                      onCheckedChange={(checked) => handleCheckboxChange('grade', grade, checked as boolean)}
                    />
                    <span className="text-xs font-medium">Grade {grade}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" />
          </div>

          {/* Chapter - Multi-select */}
          <div className="space-y-2">
            <Label className="text-foreground mb-3 block text-sm font-semibold">Chapter</Label>
            {chapters && chapters.length > 0 ? (
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {chapters.map((chapter) => (
                  <label
                    key={chapter}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={Array.isArray(filters.chapter) && filters.chapter.includes(chapter)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('chapter', chapter, checked as boolean)
                      }
                    />
                    <span className="text-xs font-medium">{chapter}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">No chapters</p>
            )}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters() && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2 font-semibold">
          <X className="h-4 w-4" />
          {t('questionBank.filters.clearFilters')}
        </Button>
      )}
    </div>
  );
};
