import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Checkbox } from '@ui/checkbox';
import { Label } from '@ui/label';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { X, Filter, ChevronDown } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useQuestionBankStore from '../../stores/questionBankStore';
import {
  useQuestionBankSubjects,
  useQuestionBankGrades,
  useQuestionBankChapters,
} from '../../hooks/useQuestionBankApi';
import { useEffect, useState } from 'react';
import { getSubjectName, getGradeName, getAllQuestionTypes, getAllDifficulties } from '@aiprimary/core';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Fetch metadata
  const { data: subjects } = useQuestionBankSubjects();
  const { data: grades } = useQuestionBankGrades();

  // Conditional chapter fetch - only when exactly one subject and one grade are selected
  const showChapters = shouldShowChapterFilter();
  const subjectForChapters = filters.subject?.length === 1 ? filters.subject[0] : undefined;
  const gradeForChapters = filters.grade?.length === 1 ? filters.grade[0] : undefined;

  const { data: chapters } = useQuestionBankChapters(subjectForChapters, gradeForChapters);

  // Reset chapter filter when subject/grade changes or becomes unavailable
  useEffect(() => {
    if (!showChapters && filters.chapter) {
      setFilters({ chapter: undefined });
    }
  }, [showChapters, filters.subject, filters.grade]);

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handleCheckboxChange = (filterKey: keyof typeof filters, value: string, checked: boolean) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);
    setFilters({ [filterKey]: newValues.length > 0 ? newValues : undefined });
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
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={t('questionBank.filters.search')}
            debounceTime={300}
          />

          {RightComponent}
        </div>
      </div>

      {/* Filters Grid - Collapsible */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-4 ${orientation === 'horizontal' ? (chapters && chapters.length > 0 ? 'grid-cols-[1fr_1fr_1fr_1fr_2fr]' : 'grid-cols-4') : 'grid-cols-1'}`}
          >
            {/* Question Type - Multi-select */}
            <div className="space-y-2">
              <Label className="text-foreground mb-3 block text-sm font-semibold">
                {t('questionBank.filters.type')}
              </Label>
              <div className="space-y-2">
                {getAllQuestionTypes().map((type) => (
                  <label
                    key={type.value}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={filters.type?.includes(type.value) || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('type', type.value, checked as boolean)
                      }
                    />
                    <span className="text-xs font-medium">{type.label}</span>
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
                {getAllDifficulties().map((difficulty) => (
                  <label
                    key={difficulty.value}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={filters.difficulty?.includes(difficulty.value) || false}
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
                      checked={filters.subject?.includes(subject) || false}
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
              <Label className="text-foreground mb-3 block text-sm font-semibold">
                {t('questionBank.filters.grade')}
              </Label>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {grades?.map((grade) => (
                  <label
                    key={grade}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={filters.grade?.includes(grade) || false}
                      onCheckedChange={(checked) => handleCheckboxChange('grade', grade, checked as boolean)}
                    />
                    <span className="text-xs font-medium">{getGradeName(grade)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chapter - Multi-select (only shown when chapters exist) */}
            {chapters && chapters.length > 0 && (
              <div className="space-y-2">
                <Label className="text-foreground mb-3 block text-sm font-semibold">
                  {t('questionBank.filters.chapter')}
                </Label>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {chapters.map((chapter) => (
                    <label
                      key={chapter.id}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={filters.chapter?.includes(chapter.name) || false}
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
          </motion.div>
        )}
      </AnimatePresence>

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
