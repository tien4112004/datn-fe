import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { X } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import type { QuestionType, Difficulty, SubjectCode } from '../../types';
import useQuestionBankStore from '../../stores/questionBankStore';

export const QuestionBankFilters = () => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, setFilters, clearFilters, hasActiveFilters } = useQuestionBankStore();

  const handleSearchChange = (value: string) => {
    setFilters({ searchText: value });
  };

  const handleTypeChange = (value: string) => {
    setFilters({
      questionType: value === 'all' ? undefined : (value as QuestionType),
    });
  };

  const handleDifficultyChange = (value: string) => {
    setFilters({
      difficulty: value === 'all' ? undefined : (value as Difficulty),
    });
  };

  const handleSubjectChange = (value: string) => {
    setFilters({
      subjectCode: value === 'all' ? undefined : (value as SubjectCode),
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Search Bar */}
      <div className="flex-1">
        <SearchBar
          value={filters.searchText}
          onChange={handleSearchChange}
          placeholder={t('questionBank.filters.search')}
          debounceTime={300}
        />
      </div>

      {/* Question Type Filter */}
      <Select value={filters.questionType || 'all'} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t('questionBank.filters.type')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('questionBank.filters.allTypes')}</SelectItem>
          <SelectItem value={QUESTION_TYPE.MULTIPLE_CHOICE}>{t('questionTypes.multipleChoice')}</SelectItem>
          <SelectItem value={QUESTION_TYPE.MATCHING}>{t('questionTypes.matching')}</SelectItem>
          <SelectItem value={QUESTION_TYPE.OPEN_ENDED}>{t('questionTypes.openEnded')}</SelectItem>
          <SelectItem value={QUESTION_TYPE.FILL_IN_BLANK}>{t('questionTypes.fillInBlank')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty Filter */}
      <Select value={filters.difficulty || 'all'} onValueChange={handleDifficultyChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t('questionBank.filters.difficulty')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('questionBank.filters.allDifficulties')}</SelectItem>
          <SelectItem value={DIFFICULTY.EASY}>{t('difficulty.nhanBiet')}</SelectItem>
          <SelectItem value={DIFFICULTY.MEDIUM}>{t('difficulty.thongHieu')}</SelectItem>
          <SelectItem value={DIFFICULTY.HARD}>{t('difficulty.vanDung')}</SelectItem>
          <SelectItem value={DIFFICULTY.SUPER_HARD}>{t('difficulty.vanDungCao')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Subject Filter */}
      <Select value={filters.subjectCode || 'all'} onValueChange={handleSubjectChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t('questionBank.filters.subject')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('questionBank.filters.allSubjects')}</SelectItem>
          <SelectItem value="T">{t('questionBank.subjects.toan')}</SelectItem>
          <SelectItem value="TV">{t('questionBank.subjects.tiengViet')}</SelectItem>
          <SelectItem value="TA">{t('questionBank.subjects.tiengAnh')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button (only show when filters are active) */}
      {hasActiveFilters() && (
        <Button
          variant="outline"
          size="icon"
          onClick={clearFilters}
          aria-label={t('questionBank.filters.clearFilters')}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
