import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { SearchBar } from '@/components/common/SearchBar';
import { X } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { SubjectCode } from '@/features/exam-matrix/types';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';

export const MatrixFilters = () => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { filters, setFilters, clearFilters, hasActiveFilters } = useExamMatrixStore();

  const handleSearchChange = (value: string) => {
    setFilters({ searchText: value });
  };

  const handleSubjectChange = (value: string) => {
    setFilters({
      subjectCode: value === 'all' ? undefined : (value as SubjectCode),
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {/* Search Bar */}
      <div className="flex-1">
        <SearchBar
          value={filters.searchText || ''}
          onChange={handleSearchChange}
          placeholder={t('filters.searchPlaceholder')}
          debounceTime={300}
        />
      </div>

      {/* Subject Filter */}
      <Select value={filters.subjectCode || 'all'} onValueChange={handleSubjectChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t('filters.subject')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allSubjects')}</SelectItem>
          <SelectItem value="T">{t('subjects.T')}</SelectItem>
          <SelectItem value="TV">{t('subjects.TV')}</SelectItem>
          <SelectItem value="TA">{t('subjects.TA')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button (only show when filters are active) */}
      {hasActiveFilters() && (
        <Button
          variant="outline"
          size="icon"
          onClick={clearFilters}
          aria-label="Clear filters"
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
