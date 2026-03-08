import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Checkbox } from '@ui/checkbox';
import { Label } from '@ui/label';
import { X, Filter, ChevronDown } from 'lucide-react';
import {
  getAllGrades,
  getAllSubjects,
  getSubjectName,
  getGradeName,
  getSubjectBadgeClass,
} from '@aiprimary/core';
import { Badge } from '@ui/badge';
import { useChapters } from '@/shared/hooks/useChapters';
import { SearchBar } from '@/shared/components/common/SearchBar';

export interface DocumentFilterValues {
  grade?: string;
  subject?: string;
  chapter?: string;
}

interface DocumentFiltersProps {
  filters: DocumentFilterValues;
  onChange: (filters: DocumentFilterValues) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  RightComponent?: React.ReactNode;
  searchPlaceholder?: string;
}

export function DocumentFilters({
  filters,
  onChange,
  searchQuery = '',
  onSearchChange,
  RightComponent,
  searchPlaceholder,
}: DocumentFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { i18n } = useTranslation();
  const tCommon = useTranslation('common').t;
  const tGlossary = useTranslation('glossary').t;

  const grades = getAllGrades();
  const subjects = getAllSubjects();

  const { chapters, isLoading: chaptersLoading } = useChapters(filters.grade, filters.subject);

  const hasActiveFilters = !!(filters.grade || filters.subject || filters.chapter);
  const showChapters = true;

  const handleGradeToggle = (code: string) => {
    const newGrade = filters.grade === code ? undefined : code;
    onChange({ ...filters, grade: newGrade, chapter: undefined });
  };

  const handleSubjectToggle = (code: string) => {
    const newSubject = filters.subject === code ? undefined : code;
    onChange({ ...filters, subject: newSubject, chapter: undefined });
  };

  const handleChapterToggle = (name: string) => {
    onChange({ ...filters, chapter: filters.chapter === name ? undefined : name });
  };

  return (
    <div className="space-y-3">
      {/* Search bar + filter toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFiltersOpen((v) => !v)}
          className="h-10 w-10 shrink-0"
          title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
        >
          <div className="flex items-center gap-0.5">
            <Filter className="h-4 w-4" />
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </Button>

        <div className="flex flex-1 gap-2">
          <SearchBar
            value={searchQuery}
            onChange={(v) => onSearchChange?.(v)}
            placeholder={searchPlaceholder}
            className="flex-1 rounded-lg border-2 border-slate-200"
          />
          {RightComponent}
        </div>
      </div>

      {/* Collapsible filter grid */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isFiltersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-3 gap-4 rounded-lg border bg-gray-50/50 p-4">
            {/* Grade */}
            <div className="space-y-2">
              <Label className="text-foreground block text-sm font-semibold">{tCommon('grade')}</Label>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {grades.map((g) => (
                  <label
                    key={g.code}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={filters.grade === g.code}
                      onCheckedChange={() => handleGradeToggle(g.code)}
                    />
                    <span className="text-xs font-medium">{i18n.language === 'vi' ? g.name : g.nameEn}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-foreground block text-sm font-semibold">{tCommon('subject')}</Label>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {subjects.map((s) => (
                  <label
                    key={s.code}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                  >
                    <Checkbox
                      checked={filters.subject === s.code}
                      onCheckedChange={() => handleSubjectToggle(s.code)}
                    />
                    <span className="text-xs font-medium">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <Label className="text-foreground block text-sm font-semibold">
                {tCommon('table.presentation.chapter')}
              </Label>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {chaptersLoading ? (
                  <span className="text-muted-foreground text-xs">...</span>
                ) : chapters.length > 0 ? (
                  chapters.map((ch) => (
                    <label
                      key={ch.id}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                    >
                      <Checkbox
                        checked={filters.chapter === ch.name}
                        onCheckedChange={() => handleChapterToggle(ch.name)}
                      />
                      <span className="max-w-full truncate text-xs font-medium" title={ch.name}>
                        {ch.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">{tCommon('selectGradeAndSubject')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.grade && (
            <Badge variant="outline" className="cursor-pointer gap-1 pr-1.5">
              {getGradeName(filters.grade)}
              <X
                className="h-3 w-3"
                onClick={() => onChange({ ...filters, grade: undefined, chapter: undefined })}
              />
            </Badge>
          )}
          {filters.subject && (
            <Badge
              variant="outline"
              className={`cursor-pointer gap-1 pr-1.5 ${getSubjectBadgeClass(filters.subject)}`}
            >
              {getSubjectName(filters.subject)}
              <X
                className="h-3 w-3"
                onClick={() => onChange({ ...filters, subject: undefined, chapter: undefined })}
              />
            </Badge>
          )}
          {filters.chapter && (
            <Badge variant="outline" className="cursor-pointer gap-1 pr-1.5">
              {filters.chapter}
              <X className="h-3 w-3" onClick={() => onChange({ ...filters, chapter: undefined })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => onChange({})} className="h-6 gap-1 px-2 text-xs">
            <X className="h-3 w-3" />
            {tGlossary('actions.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
