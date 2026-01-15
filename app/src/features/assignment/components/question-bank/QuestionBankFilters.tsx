import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { X, Filter, ChevronDown } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import useQuestionBankStore from '../../stores/questionBankStore';
import { useQuestionBankChapters } from '../../hooks/useQuestionBankApi';
import { useEffect, useState } from 'react';
import {
  getSubjectName,
  getGradeName,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  getAllGrades,
  getAllSubjects,
} from '@aiprimary/core';
import { motion } from 'motion/react';

interface QuestionBankFiltersProps {
  orientation?: 'horizontal' | 'vertical';
  RightComponent?: React.ReactNode;
}

export const QuestionBankFilters = ({
  orientation = 'horizontal',
  RightComponent,
}: QuestionBankFiltersProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, setFilters, clearFilters, hasActiveFilters, shouldShowChapterFilter } =
    useQuestionBankStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Get subjects and grades from constants
  const subjects = getAllSubjects().map((s) => s.code);
  const grades = getAllGrades().map((g) => g.code);

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
          <SearchBar
            value={filters.searchText}
            onChange={handleSearchChange}
            placeholder={t('questionBank.filters.search')}
            debounceTime={300}
          />

          {RightComponent}
        </div>
      </div>

      {/* Filters Grid - Collapsible */}
      {isFiltersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`grid gap-4 ${orientation === 'horizontal' ? 'grid-cols-5' : 'grid-cols-1'}`}
        >
          {/* Question Type - Multi-select */}
          <div className="space-y-2">
            <Label className="text-foreground mb-3 block text-sm font-semibold">
              {t('questionBank.filters.type')}
            </Label>
            <div className="space-y-2">
              {[
                { value: QUESTION_TYPE.MULTIPLE_CHOICE, label: QUESTION_TYPE_LABELS.multiple_choice },
                { value: QUESTION_TYPE.MATCHING, label: QUESTION_TYPE_LABELS.matching },
                { value: QUESTION_TYPE.OPEN_ENDED, label: QUESTION_TYPE_LABELS.open_ended },
                { value: QUESTION_TYPE.FILL_IN_BLANK, label: QUESTION_TYPE_LABELS.fill_in_blank },
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

          {/* Difficulty - Multi-select */}
          <div className="space-y-2">
            <Label className="text-foreground mb-3 block text-sm font-semibold">
              {t('questionBank.filters.difficulty')}
            </Label>
            <div className="space-y-2">
              {[
                { value: DIFFICULTY.EASY, label: DIFFICULTY_LABELS.nhan_biet },
                { value: DIFFICULTY.MEDIUM, label: DIFFICULTY_LABELS.thong_hieu },
                { value: DIFFICULTY.HARD, label: DIFFICULTY_LABELS.van_dung },
                { value: DIFFICULTY.SUPER_HARD, label: DIFFICULTY_LABELS.van_dung_cao },
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

          {/* Subject - Multi-select */}
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
                  <span className="text-xs font-medium">{getSubjectName(subject)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Grade - Multi-select */}
          <div className="space-y-2">
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
                  <span className="text-xs font-medium">{getGradeName(grade)}</span>
                </label>
              ))}
            </div>
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
        </motion.div>
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
