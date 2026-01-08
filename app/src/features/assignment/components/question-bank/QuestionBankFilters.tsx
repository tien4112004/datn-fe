import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { X } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import useQuestionBankStore from '../../stores/questionBankStore';
import {
  useQuestionBankSubjects,
  useQuestionBankGrades,
  useQuestionBankChapters,
} from '../../hooks/useQuestionBankApi';
import { useEffect } from 'react';

export const QuestionBankFilters = () => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, setFilters, clearFilters, hasActiveFilters, shouldShowChapterFilter } =
    useQuestionBankStore();

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
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <SearchBar
        value={filters.searchText}
        onChange={handleSearchChange}
        placeholder={t('questionBank.filters.search')}
        debounceTime={300}
      />

      {/* Question Type - Multi-select */}
      <div>
        <Label className="text-sm font-medium">{t('questionBank.filters.type')}</Label>
        <div className="mt-2 space-y-2">
          {[
            { value: QUESTION_TYPE.MULTIPLE_CHOICE, label: t('questionTypes.multipleChoice') },
            { value: QUESTION_TYPE.MATCHING, label: t('questionTypes.matching') },
            { value: QUESTION_TYPE.OPEN_ENDED, label: t('questionTypes.openEnded') },
            { value: QUESTION_TYPE.FILL_IN_BLANK, label: t('questionTypes.fillInBlank') },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.questionType) && filters.questionType.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('questionType', option.value, checked as boolean)
                }
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty - Multi-select */}
      <div>
        <Label className="text-sm font-medium">{t('questionBank.filters.difficulty')}</Label>
        <div className="mt-2 space-y-2">
          {[
            { value: DIFFICULTY.EASY, label: t('difficulty.nhanBiet') },
            { value: DIFFICULTY.MEDIUM, label: t('difficulty.thongHieu') },
            { value: DIFFICULTY.HARD, label: t('difficulty.vanDung') },
            { value: DIFFICULTY.SUPER_HARD, label: t('difficulty.vanDungCao') },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Array.isArray(filters.difficulty) && filters.difficulty.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('difficulty', option.value, checked as boolean)
                }
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject - Multi-select */}
      <div>
        <Label className="text-sm font-medium">{t('questionBank.filters.subject')}</Label>
        <div className="mt-2 space-y-2">
          {subjects?.map((subject) => (
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

      {/* Grade - Multi-select */}
      <div>
        <Label className="text-sm font-medium">Grade</Label>
        <div className="mt-2 space-y-2">
          {grades?.map((grade) => (
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

      {/* Conditional Chapter Filter */}
      {showChapters && chapters && chapters.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
          <Label className="text-sm font-medium">Chapter</Label>
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

      {showChapters && chapters && chapters.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          No chapters available for selected subject and grade.
        </p>
      )}

      {!showChapters && (
        <p className="text-muted-foreground text-xs italic">
          Select exactly 1 subject and 1 grade to see chapter options.
        </p>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters() && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2">
          <X className="h-4 w-4" />
          {t('questionBank.filters.clearFilters')}
        </Button>
      )}
    </div>
  );
};
