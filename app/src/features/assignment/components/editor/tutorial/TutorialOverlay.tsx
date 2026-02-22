import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTutorialStore } from '../../../stores/useTutorialStore';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import { TUTORIAL_STEPS } from './tutorialSteps';
import { useTutorialPosition } from './useTutorialPosition';
import { TutorialPopover } from './TutorialPopover';
import type { AssignmentQuestionWithTopic, AssignmentContext } from '../../../types';

const CUTOUT_RX = 6;

interface FormSnapshot {
  questions: AssignmentQuestionWithTopic[];
  contexts: AssignmentContext[];
}

function buildMockQuestions(topicId: string, contextId: string): AssignmentQuestionWithTopic[] {
  return [
    {
      question: {
        id: '__tutorial-q1__',
        type: 'MULTIPLE_CHOICE' as const,
        difficulty: 'KNOWLEDGE' as const,
        title: '',
        data: { options: [], shuffleOptions: false },
        topicId,
      },
      points: 1,
    },
    {
      question: {
        id: '__tutorial-q2__',
        type: 'MULTIPLE_CHOICE' as const,
        difficulty: 'KNOWLEDGE' as const,
        title: '',
        data: { options: [], shuffleOptions: false },
        topicId,
        contextId,
      },
      points: 1,
    },
    {
      question: {
        id: '__tutorial-q3__',
        type: 'MULTIPLE_CHOICE' as const,
        difficulty: 'KNOWLEDGE' as const,
        title: '',
        data: { options: [], shuffleOptions: false },
        topicId,
        contextId,
      },
      points: 1,
    },
  ];
}

export const TutorialOverlay = () => {
  const isActive = useTutorialStore((s) => s.isActive);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const prevStep = useTutorialStore((s) => s.prevStep);
  const stopTutorial = useTutorialStore((s) => s.stopTutorial);

  const step = TUTORIAL_STEPS[currentStepIndex];
  const totalSteps = TUTORIAL_STEPS.length;

  const { rect, targetFound } = useTutorialPosition(step?.target ?? '');

  // Mock data: snapshot original data, replace with mock, restore on cleanup
  const snapshotRef = useRef<FormSnapshot | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const store = useAssignmentFormStore.getState();

    // Snapshot current data
    snapshotRef.current = {
      questions: store.questions,
      contexts: store.contexts,
    };

    // Inject mock context and questions
    const contextId = store.addContext({ title: 'Tutorial Example', content: '' });
    const topicId = store.topics[0]?.id ?? '__tutorial__';
    store.setQuestions(buildMockQuestions(topicId, contextId));

    // Mock data shouldn't mark form as dirty
    store.markClean();

    return () => {
      if (snapshotRef.current) {
        const s = useAssignmentFormStore.getState();
        // Restore: re-initialize with current metadata + original questions/contexts
        s.initialize({
          title: s.title,
          description: s.description,
          subject: s.subject,
          grade: s.grade,
          topics: s.topics,
          matrix: s.matrix,
          questions: snapshotRef.current.questions,
          contexts: snapshotRef.current.contexts,
        });
        snapshotRef.current = null;
      }
    };
  }, [isActive]);

  const handleNext = () => {
    if (currentStepIndex >= totalSteps - 1) {
      stopTutorial();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  if (!isActive || !step) return null;

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tutorial"
          style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
        >
          {/* SVG Mask Overlay */}
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 10000,
            }}
          >
            <defs>
              <mask id="tutorial-mask">
                {/* White = visible (overlay shows) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* Black = cutout (transparent) */}
                {rect && targetFound && (
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{
                      x: rect.left,
                      y: rect.top,
                      width: rect.width,
                      height: rect.height,
                      opacity: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    rx={CUTOUT_RX}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              className="fill-black/50 dark:fill-black/60"
              mask="url(#tutorial-mask)"
            />
          </motion.svg>

          {/* Popover */}
          <AnimatePresence mode="wait">
            {rect && targetFound && (
              <TutorialPopover
                key={currentStepIndex}
                targetRect={rect}
                placement={step.placement}
                i18nKey={step.i18nKey}
                currentStep={currentStepIndex}
                totalSteps={totalSteps}
                onNext={handleNext}
                onPrev={handlePrev}
                onClose={stopTutorial}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
