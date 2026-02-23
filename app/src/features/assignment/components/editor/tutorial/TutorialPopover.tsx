import { useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import type { TutorialPlacement } from './tutorialSteps';

interface PopoverPosition {
  top: number;
  left: number;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const POPOVER_WIDTH = 300;
const POPOVER_GAP = 12;

function computePopoverPosition(placement: TutorialPlacement, targetRect: TargetRect): PopoverPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + POPOVER_GAP;
      left = targetRect.left + targetRect.width / 2 - POPOVER_WIDTH / 2;
      break;
    case 'top':
      top = targetRect.top - POPOVER_GAP - 160;
      left = targetRect.left + targetRect.width / 2 - POPOVER_WIDTH / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - 80;
      left = targetRect.left - POPOVER_WIDTH - POPOVER_GAP;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - 80;
      left = targetRect.right + POPOVER_GAP;
      break;
  }

  // Clamp within viewport
  left = Math.max(12, Math.min(left, vw - POPOVER_WIDTH - 12));
  top = Math.max(12, Math.min(top, vh - 200));

  return { top, left };
}

const slideVariants: Record<TutorialPlacement, { x: number; y: number }> = {
  bottom: { x: 0, y: -8 },
  top: { x: 0, y: 8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
};

interface TutorialPopoverProps {
  targetRect: TargetRect;
  placement: TutorialPlacement;
  i18nKey: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const TutorialPopover = ({
  targetRect,
  placement,
  i18nKey,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
}: TutorialPopoverProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.tutorial' });
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const pos = computePopoverPosition(placement, targetRect);
  const slide = slideVariants[placement];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirstStep) onPrev();
      }
    },
    [onClose, onNext, onPrev, isFirstStep]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tAny = t as any;

  const title = tAny(`steps.${i18nKey}.title`);
  const description = tAny(`steps.${i18nKey}.description`);

  return (
    <motion.div
      initial={{ opacity: 0, ...slide }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...slide }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: POPOVER_WIDTH,
        zIndex: 10001,
      }}
      className="border-border bg-popover text-popover-foreground rounded-lg border p-4 shadow-lg"
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground ml-2 shrink-0 rounded p-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 text-xs leading-relaxed">{description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {t('progress', { current: currentStep + 1, total: totalSteps })}
        </span>

        <div className="flex gap-1.5">
          {!isFirstStep && (
            <Button type="button" size="sm" variant="ghost" onClick={onPrev} className="h-7 px-2 text-xs">
              <ChevronLeft className="mr-1 h-3 w-3" />
              {t('actions.back')}
            </Button>
          )}
          <Button type="button" size="sm" onClick={onNext} className="h-7 px-3 text-xs">
            {isLastStep ? t('actions.finish') : t('actions.next')}
            {!isLastStep && <ChevronRight className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
