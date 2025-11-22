import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClassStore } from '../../shared/stores';
import {
  getCurrentAcademicYear,
  getNextAcademicYear,
  getPreviousAcademicYear,
} from '../../shared/utils/grades';
import { GRADE_LABELS } from '../../shared/types';

export const ClassFilters = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'filters' });
  const { filters, setFilters, clearFilters } = useClassStore();

  const currentYear = getCurrentAcademicYear();
  const academicYears = [getPreviousAcademicYear(currentYear), currentYear, getNextAcademicYear(currentYear)];

  const handleSearchChange = (value: string) => {
    setFilters({ search: value || undefined });
  };

  const handleGradeChange = (value: string) => {
    setFilters({ grade: value ? parseInt(value, 10) : undefined });
  };

  const handleAcademicYearChange = (value: string) => {
    setFilters({ academicYear: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      isActive: value === 'active' ? true : value === 'inactive' ? false : undefined,
    });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('search.placeholder')}
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Grade Filter */}
          <Select value={filters.grade?.toString() || ''} onValueChange={handleGradeChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder={t('grade.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GRADE_LABELS).map(([grade, label]) => (
                <SelectItem key={grade} value={grade}>
                  {String(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Academic Year Filter */}
          <Select value={filters.academicYear || ''} onValueChange={handleAcademicYearChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder={t('academicYear.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.isActive === true ? 'active' : filters.isActive === false ? 'inactive' : ''}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder={t('status.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('status.active')}</SelectItem>
              <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              {t('clearFilters')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
