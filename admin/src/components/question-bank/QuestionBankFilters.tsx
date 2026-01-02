import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { QuestionBankParams } from '@/types/question-bank';
import { QUESTION_TYPE, DIFFICULTY, SUBJECT_CODE } from '@/types/question-bank';

interface QuestionBankFiltersProps {
  filters: QuestionBankParams;
  onChange: (filters: QuestionBankParams) => void;
}

export function QuestionBankFilters({ filters, onChange }: QuestionBankFiltersProps) {
  const hasActiveFilters = !!filters.questionType || !!filters.difficulty || !!filters.subjectCode;

  const handleClearFilters = () => {
    onChange({});
  };

  return (
    <div className="bg-card flex items-end gap-4 rounded-lg border p-4">
      <div className="flex-1 space-y-2">
        <Label className="text-xs">Question Type</Label>
        <Select
          value={filters.questionType || 'all'}
          onValueChange={(value) =>
            onChange({
              ...filters,
              questionType: value === 'all' ? undefined : (value as any),
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={QUESTION_TYPE.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
            <SelectItem value={QUESTION_TYPE.MATCHING}>Matching</SelectItem>
            <SelectItem value={QUESTION_TYPE.OPEN_ENDED}>Open-ended</SelectItem>
            <SelectItem value={QUESTION_TYPE.FILL_IN_BLANK}>Fill In Blank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label className="text-xs">Subject</Label>
        <Select
          value={filters.subjectCode || 'all'}
          onValueChange={(value) =>
            onChange({
              ...filters,
              subjectCode: value === 'all' ? undefined : (value as any),
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value={SUBJECT_CODE.MATH}>Math (Toán)</SelectItem>
            <SelectItem value={SUBJECT_CODE.VIETNAMESE}>Vietnamese (Tiếng Việt)</SelectItem>
            <SelectItem value={SUBJECT_CODE.ENGLISH}>English (Tiếng Anh)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label className="text-xs">Difficulty</Label>
        <Select
          value={filters.difficulty || 'all'}
          onValueChange={(value) =>
            onChange({
              ...filters,
              difficulty: value === 'all' ? undefined : (value as any),
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value={DIFFICULTY.EASY}>Nhận biết (Knowledge)</SelectItem>
            <SelectItem value={DIFFICULTY.MEDIUM}>Thông hiểu (Comprehension)</SelectItem>
            <SelectItem value={DIFFICULTY.HARD}>Vận dụng (Application)</SelectItem>
            <SelectItem value={DIFFICULTY.SUPER_HARD}>Vận dụng cao (Advanced)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
