import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { MatrixGapsSummary } from './MatrixGapsSummary';
import { FillMatrixGapsPanel } from './FillMatrixGapsPanel';
import { FillMatrixGapsResultPanel } from './FillMatrixGapsResultPanel';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import type { MatrixGapDto } from '../../../types/assignment';
import type { QuestionBankItem } from '@/features/question-bank/types';

type Step = 'review' | 'generate' | 'result';

interface FillMatrixGapsManagerProps {
  onClose: () => void;
  onQuestionsAdded?: () => void;
}

export function FillMatrixGapsManager({ onClose, onQuestionsAdded }: FillMatrixGapsManagerProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  const matrix = useAssignmentFormStore((state) => state.matrix);

  const missingQuestions = useMemo(
    (): MatrixGapDto[] =>
      (matrix ?? [])
        .filter((cell) => cell.requiredCount > cell.currentCount)
        .map((cell) => ({
          topic: cell.topicName,
          difficulty: cell.difficulty,
          questionType: cell.questionType,
          requiredCount: cell.requiredCount,
          availableCount: cell.currentCount,
          gapCount: cell.requiredCount - cell.currentCount,
        })),
    [matrix]
  );

  const isComplete = missingQuestions.length === 0;

  const [step, setStep] = useState<Step>('review');
  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(
    () => new Set(missingQuestions.map((_, idx) => idx.toString()))
  );
  const [frozenGaps, setFrozenGaps] = useState<MatrixGapDto[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionBankItem[]>([]);

  const handleProceed = () => {
    if (selectedGaps.size === 0) {
      toast.error(String(t('errors.noGapsSelected')));
      return;
    }
    const selected = Array.from(selectedGaps)
      .map((id) => parseInt(id))
      .map((idx) => missingQuestions[idx])
      .filter(Boolean);
    setFrozenGaps(selected);
    setStep('generate');
  };

  if (step === 'generate') {
    return (
      <FillMatrixGapsPanel
        gaps={frozenGaps}
        onBack={() => setStep('review')}
        onSuccess={(questions) => {
          setGeneratedQuestions(questions);
          setStep('result');
        }}
      />
    );
  }

  if (step === 'result') {
    return (
      <FillMatrixGapsResultPanel
        questions={generatedQuestions}
        filledGapsCount={frozenGaps.length}
        onBack={() => setStep('generate')}
        onDone={() => {
          toast.success(String(t('success', { count: frozenGaps.length })));
          onQuestionsAdded?.();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <MatrixGapsSummary
        gaps={missingQuestions}
        isComplete={isComplete}
        onSelectedGapsChange={setSelectedGaps}
        totalMissingQuestions={missingQuestions.reduce((sum, gap) => sum + gap.gapCount, 0)}
      />

      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {String(t('actions.backToMatrix'))}
        </Button>
        {!isComplete && (
          <Button onClick={handleProceed} className="flex-1" disabled={selectedGaps.size === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            {String(t('actions.generateQuestions'))}
          </Button>
        )}
      </div>
    </div>
  );
}
