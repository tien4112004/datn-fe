import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClassStore } from '../../shared/stores';
import {
  getCurrentAcademicYear,
  getNextAcademicYear,
  getPreviousAcademicYear,
} from '../../shared/utils/grades';
import { getElementaryGrades } from '@aiprimary/core';

export const ClassFilters = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'filters' });
  const filters = useClassStore((state) => state.filters);
  const setFilters = useClassStore((state) => state.setFilters);
  const clearFilters = useClassStore((state) => state.clearFilters);

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Get grade options from core package
  const gradeOptions = useMemo(() => getElementaryGrades(), []);

  // Generate academic year options
  const academicYears = useMemo(() => {
    const currentYear = getCurrentAcademicYear();
    return [
      getPreviousAcademicYear(currentYear),
      currentYear,
      getNextAcademicYear(currentYear),
      getNextAcademicYear(getNextAcademicYear(currentYear)),
    ];
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchInput || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, setFilters]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleGradeChange = (value: string) => {
    setFilters({ grade: value === 'all' ? undefined : parseInt(value, 10) });
  };

  const handleAcademicYearChange = (value: string) => {
    setFilters({ academicYear: value === 'all' ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      isActive: value === 'all' ? undefined : value === 'active',
    });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined
  );

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof typeof filters] !== undefined
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Grade Filter */}
        <Select value={filters.grade?.toString() || 'all'} onValueChange={handleGradeChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('grade.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('grade.all')}</SelectItem>
            {gradeOptions.map((grade) => (
              <SelectItem key={grade.code} value={grade.code}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Academic Year Filter */}
        <Select value={filters.academicYear || 'all'} onValueChange={handleAcademicYearChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('academicYear.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('academicYear.all')}</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder={t('status.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5 whitespace-nowrap">
            <X className="h-4 w-4" />
            {t('clearAll')}
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <Filter className="h-3.5 w-3.5" />
          <span>{t('activeFilters')}:</span>
          {filters.grade && (
            <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1">
              {t('grade.label')}: {gradeOptions.find((g) => g.code === filters.grade?.toString())?.name}
              <button
                onClick={() => handleGradeChange('all')}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.academicYear && (
            <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1">
              {t('academicYear.label')}: {filters.academicYear}
              <button
                onClick={() => handleAcademicYearChange('all')}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.isActive !== undefined && (
            <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1">
              {t('status.label')}: {filters.isActive ? t('status.active') : t('status.inactive')}
              <button
                onClick={() => handleStatusChange('all')}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1">
              {t('search.label')}: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
