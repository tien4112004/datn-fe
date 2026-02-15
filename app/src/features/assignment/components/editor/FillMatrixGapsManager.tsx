import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { MatrixGapsSummary } from './MatrixGapsSummary';
import { FillMatrixGapsPanel } from './FillMatrixGapsPanel';
import type { ExamDraftDto } from '@/features/assignment/types/assignment';

interface FillMatrixGapsManagerProps {
  draft: ExamDraftDto;
  onClose: () => void;
  onQuestionsAdded?: () => void;
}

export function FillMatrixGapsManager({ draft, onClose, onQuestionsAdded }: FillMatrixGapsManagerProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  // Auto-select all gaps on mount
  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(
    () => new Set(draft.missingQuestions.map((_, idx) => idx.toString()))
  );

  // If gaps selected, show the generation panel
  if (selectedGaps.size > 0) {
    return (
      <FillMatrixGapsPanel
        gaps={Array.from(selectedGaps)
          .map((id) => parseInt(id))
          .map((idx) => draft.missingQuestions[idx])}
        onBack={() => setSelectedGaps(new Set())}
        onSuccess={() => {
          toast.success(String(t('success', { count: selectedGaps.size })));
          onQuestionsAdded?.();
          onClose();
        }}
      />
    );
  }

  // Show gaps summary
  return (
    <div className="space-y-4">
      <MatrixGapsSummary
        gaps={draft.missingQuestions}
        isComplete={draft.isComplete}
        onSelectedGapsChange={setSelectedGaps}
        totalMissingQuestions={draft.missingQuestions.reduce((sum, gap) => sum + gap.gapCount, 0)}
      />

      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {String(t('actions.backToMatrix'))}
        </Button>
      </div>
    </div>
  );
}
