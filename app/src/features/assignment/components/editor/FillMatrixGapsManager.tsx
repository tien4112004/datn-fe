import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useAssignmentFormStore } from '@/features/assignment/stores/useAssignmentFormStore';
import { useGenerateExamFromMatrix } from '@/features/assignment/hooks/useAssignmentApi';
import { cellsToApiMatrix } from '@/features/assignment/utils/matrixConversion';
import { MatrixGapsSummary } from './MatrixGapsSummary';
import { FillMatrixGapsPanel } from './FillMatrixGapsPanel';
import type { ExamDraftDto, MatrixGapDto } from '@/features/assignment/types/assignment';
import type { Grade, SubjectCode } from '@aiprimary/core';

interface FillMatrixGapsManagerProps {
  onClose: () => void;
  onQuestionsAdded?: () => void;
}

export function FillMatrixGapsManager({ onClose, onQuestionsAdded }: FillMatrixGapsManagerProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  // Get assignment data
  const { title, subject, grade, matrix, topics } = useAssignmentFormStore((state) => ({
    title: state.title,
    subject: state.subject,
    grade: state.grade,
    matrix: state.matrix,
    topics: state.topics,
  }));

  // State management
  const [stage, setStage] = useState<'detecting' | 'review' | 'generating'>('detecting');
  const [draft, setDraft] = useState<ExamDraftDto | null>(null);
  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // API hook
  const detectGapsMutation = useGenerateExamFromMatrix();

  // Detect gaps on mount
  useEffect(() => {
    detectGaps();
  }, []);

  const detectGaps = async () => {
    try {
      setStage('detecting');
      setError(null);

      // Validate that matrix exists and has requirements
      if (!matrix || matrix.length === 0) {
        setError(t('errors.noMatrix'));
        setStage('review');
        return;
      }

      const totalCells = matrix.flat().flat().length;
      const hasRequirements = matrix.some((topic) =>
        topic.some((difficulty) => difficulty.some((cell) => cell.requiredCount > 0))
      );

      if (!hasRequirements) {
        setError(t('errors.noRequirements'));
        setStage('review');
        return;
      }

      // Convert matrix to API format using existing utility
      const apiMatrix = cellsToApiMatrix(matrix, {
        grade: (grade || 'K') as Grade,
        subject: (subject || 'SCIENCE') as SubjectCode,
      });

      // Call API to detect gaps
      const result = await detectGapsMutation.mutateAsync({
        subject: subject || '',
        title: title || 'Test Matrix',
        matrix: {
          metadata: {
            id: 'temp',
            name: 'Matrix',
            grade: grade || '',
            subject: subject || '',
            createdAt: new Date().toISOString(),
          },
          dimensions: apiMatrix.dimensions,
          matrix: apiMatrix.matrix,
        },
        missingStrategy: 'REPORT_GAPS',
      });

      setDraft(result);

      // Auto-select all gaps for convenience
      const allGapIds = result.missingQuestions.map((_, idx) => idx.toString());
      setSelectedGaps(new Set(allGapIds));

      setStage('review');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.detectionFailed');
      setError(errorMessage);
      toast.error(errorMessage);
      setStage('review');
    }
  };

  // Detecting state
  if (stage === 'detecting') {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('detecting')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !draft) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </Card>
        <Button onClick={onClose} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.backToMatrix')}
        </Button>
      </div>
    );
  }

  // No draft means detection failed
  if (!draft) {
    return (
      <div className="space-y-4">
        <Card className="border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">{t('errors.detectionFailed')}</p>
        </Card>
        <Button onClick={onClose} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.backToMatrix')}
        </Button>
      </div>
    );
  }

  // Review stage - show gaps or generation panel
  if (stage === 'review') {
    // If gaps selected, show the generation panel
    if (selectedGaps.size > 0) {
      return (
        <FillMatrixGapsPanel
          gaps={Array.from(selectedGaps)
            .map((id) => parseInt(id))
            .map((idx) => draft.missingQuestions[idx])}
          onBack={() => setSelectedGaps(new Set())}
          onSuccess={() => {
            toast.success(t('success', { count: selectedGaps.size }));
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
            {t('actions.backToMatrix')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
