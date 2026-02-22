import { useState, useMemo, Fragment, type ReactNode } from 'react';
import {
  Save,
  Wand2,
  Database,
  Plus,
  Library,
  Sparkles,
  Shuffle,
  ListChecks,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@ui/button';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/sheet';
import { CurrentQuestionView } from './questions/CurrentQuestionView';
import { AssignmentMetadataPanel } from './metadata/AssignmentMetadataPanel';
import { MatrixBuilderPanel } from './matrix/MatrixBuilderPanel';
import { ContextsPanel } from './contexts/ContextsPanel';
import { ContextGroupPanel } from './contexts/ContextGroupPanel';
import { GenerateFromContextManager } from './contexts/GenerateFromContextManager';
import { QuestionNavigator } from './questions/QuestionNavigator';
import { AddQuestionButton } from './questions/AddQuestionButton';
import { QuestionsListViewPanel } from '../viewer/QuestionsListViewPanel';
import { GenerateQuestionsManager } from './questions/GenerateQuestionsManager';
import { GenerateMatrixManager } from './matrix/GenerateMatrixManager';
import { FillMatrixGapsManager } from './matrix/FillMatrixGapsManager';
import { MatrixTemplateLibraryDialog } from './templates/MatrixTemplateLibraryDialog';
import { MatrixTemplateSaveDialog } from './templates/MatrixTemplateSaveDialog';
import { BulkPointsDialog } from './metadata/BulkPointsDialog';
import { groupQuestionsByContext, flattenQuestionGroups } from '../../utils/questionGrouping';
import type { GroupingContext } from '../../utils/questionGrouping';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { useGenerateExamFromMatrix } from '../../hooks/useAssignmentApi';
import { cellsToApiMatrix } from '../../utils/matrixConversion';
import type { ExamDraftDto } from '../../types/assignment';

interface AssignmentEditorLayoutProps {
  onCancel: () => void;
  onSave: () => void;
  onSaveAndExit: () => void;
  isSaving: boolean;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export const AssignmentEditorLayout = ({
  onCancel,
  onSave,
  onSaveAndExit,
  isSaving,
  sidebarOpen,
  onSidebarOpenChange,
}: AssignmentEditorLayoutProps) => {
  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);
  const setContextCreateFormOpen = useAssignmentEditorStore((state) => state.setContextCreateFormOpen);
  const setContextLibraryDialogOpen = useAssignmentEditorStore((state) => state.setContextLibraryDialogOpen);
  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);
  const isMatrixTemplateLibraryDialogOpen = useAssignmentEditorStore(
    (state) => state.isMatrixTemplateLibraryDialogOpen
  );
  const setMatrixTemplateLibraryDialogOpen = useAssignmentEditorStore(
    (state) => state.setMatrixTemplateLibraryDialogOpen
  );
  const isMatrixTemplateSaveDialogOpen = useAssignmentEditorStore(
    (state) => state.isMatrixTemplateSaveDialogOpen
  );
  const setMatrixTemplateSaveDialogOpen = useAssignmentEditorStore(
    (state) => state.setMatrixTemplateSaveDialogOpen
  );
  const title = useAssignmentFormStore((state) => state.title);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const matrix = useAssignmentFormStore((state) => state.matrix);
  const questions = useAssignmentFormStore((state) => state.questions);
  const contexts = useAssignmentFormStore((state) => state.contexts);
  const topics = useAssignmentFormStore((state) => state.topics);
  const importMatrixTemplate = useAssignmentFormStore((state) => state.importMatrixTemplate);
  const setQuestions = useAssignmentFormStore((state) => state.setQuestions);
  const isBulkPointsDialogOpen = useAssignmentEditorStore((state) => state.isBulkPointsDialogOpen);
  const setBulkPointsDialogOpen = useAssignmentEditorStore((state) => state.setBulkPointsDialogOpen);
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });
  const { t: tFillGaps } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.fillMatrixGaps' });
  const { t: tToolbar } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const { t: tContextsPanel } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.contextsPanel' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.actions' });
  const { t: tMatrixActions } = useTranslation('assignment', { keyPrefix: 'matrixActions' });

  // Fill Matrix Gaps state
  const [fillMatrixDraft, setFillMatrixDraft] = useState<ExamDraftDto | null>(null);
  const [isFillMatrixLoading, setIsFillMatrixLoading] = useState(false);
  const detectGapsMutation = useGenerateExamFromMatrix();

  // Context questions for contextGroup view
  const contextQuestions = useMemo(
    () => (currentContextId ? questions.filter((q) => q.question.contextId === currentContextId) : []),
    [questions, currentContextId]
  );

  const handleFillMatrixGaps = async () => {
    // Validate matrix exists and has requirements
    if (!matrix || matrix.length === 0) {
      toast.error(tFillGaps('errors.noMatrix'));
      return;
    }

    if (!matrix.some((cell) => cell.requiredCount > 0)) {
      toast.error(tFillGaps('errors.noRequirements'));
      return;
    }

    if (!grade || !subject) {
      toast.error(tFillGaps('errors.missingMetadata'));
      return;
    }

    setIsFillMatrixLoading(true);
    try {
      const apiMatrix = cellsToApiMatrix(matrix, { grade, subject }, topics);
      const result = await detectGapsMutation.mutateAsync({
        subject: subject || '',
        title: title || 'Test Matrix',
        matrix: apiMatrix,
        missingStrategy: 'REPORT_GAPS',
      });

      setFillMatrixDraft(result);
      setMainView('fillMatrixGaps');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : tFillGaps('errors.detectionFailed');
      toast.error(errorMessage);
    } finally {
      setIsFillMatrixLoading(false);
    }
  };

  const handleShuffleQuestions = () => {
    if (questions.length < 2) return;

    const contextsMap = new Map<string, GroupingContext>();
    contexts.forEach((ctx) => contextsMap.set(ctx.id, ctx));

    const groups = groupQuestionsByContext(questions, contextsMap);

    // Fisher-Yates shuffle on groups
    const shuffled = [...groups];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setQuestions(flattenQuestionGroups(shuffled));
    toast.success(t('toasts.questionsShuffled'));
  };

  const handleShuffleContextQuestions = () => {
    if (!currentContextId) return;

    // Get indices of questions in this context
    const contextEntries = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.question.contextId === currentContextId);

    if (contextEntries.length < 2) return;

    // Fisher-Yates shuffle on just those items
    const shuffledQuestions = [...questions];
    const indices = contextEntries.map(({ i }) => i);
    const contextQs = indices.map((i) => shuffledQuestions[i]);

    for (let i = contextQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [contextQs[i], contextQs[j]] = [contextQs[j], contextQs[i]];
    }

    indices.forEach((originalIdx, newIdx) => {
      shuffledQuestions[originalIdx] = contextQs[newIdx];
    });

    setQuestions(shuffledQuestions);
    toast.success(t('toasts.contextQuestionsShuffled'));
  };

  const isContextGroup = mainView === 'contextGroup';

  const actionRegistry: Record<ActionKey, ActionConfig> = {
    addQuestion: {
      icon: Plus,
      label: '',
      tooltip: '',
      onClick: () => {},
      render: () => (
        <AddQuestionButton
          className="w-full"
          contextId={isContextGroup ? (currentContextId ?? undefined) : undefined}
        />
      ),
    },
    generate: {
      icon: Wand2,
      label: tToolbar('generate'),
      tooltip: tActions('tooltips.generate'),
      onClick: () => setMainView('generateQuestions'),
    },
    fromBank: {
      icon: Database,
      label: tToolbar('fromBank'),
      tooltip: tActions('tooltips.fromBank'),
      onClick: () => setQuestionBankOpen(true),
    },
    shuffle: {
      icon: Shuffle,
      label: tToolbar('shuffleQuestions'),
      tooltip: isContextGroup
        ? tActions('tooltips.shuffleContextQuestions')
        : tActions('tooltips.shuffleQuestions'),
      onClick: isContextGroup ? handleShuffleContextQuestions : handleShuffleQuestions,
      disabled: isContextGroup ? contextQuestions.length < 2 : questions.length < 2,
    },
    bulkPoints: {
      icon: ListChecks,
      label: tToolbar('bulkPoints'),
      tooltip: isContextGroup ? tActions('tooltips.bulkPointsContext') : tActions('tooltips.bulkPoints'),
      onClick: () => setBulkPointsDialogOpen(true),
      disabled: isContextGroup ? contextQuestions.length === 0 : questions.length === 0,
    },
    generateFromContext: {
      icon: Wand2,
      label: tToolbar('generateFromContext'),
      tooltip: tActions('tooltips.generateFromContext'),
      onClick: () => setMainView('generateFromContext'),
    },
    addTopic: {
      icon: Plus,
      label: t('matrixEditor.addTopic'),
      tooltip: t('matrixBuilder.tooltips.addTopic'),
      onClick: () => window.dispatchEvent(new CustomEvent('matrix.addTopic')),
    },
    generateMatrix: {
      icon: Wand2,
      label: t('matrixBuilder.generateMatrix'),
      tooltip: tActions('tooltips.generateMatrix'),
      onClick: () => setMainView('generateMatrix'),
    },
    fillMatrixGaps: {
      icon: Sparkles,
      label: t('actions.fillMatrixGaps'),
      tooltip: t('actions.tooltips.fillMatrixGaps'),
      onClick: handleFillMatrixGaps,
      disabled: isFillMatrixLoading,
    },
    templateLibrary: {
      icon: Library,
      label: tMatrixActions('templateLibrary'),
      tooltip:
        !subject || !grade
          ? tMatrixActions('templateLibraryDisabled')
          : tMatrixActions('templateLibraryTooltip'),
      onClick: () => setMatrixTemplateLibraryDialogOpen(true),
      disabled: !subject || !grade,
    },
    saveAsTemplate: {
      icon: Save,
      label: tMatrixActions('saveAsTemplate'),
      tooltip:
        !subject || !grade
          ? tMatrixActions('saveAsTemplateDisabledMetadata')
          : !matrix || matrix.length === 0
            ? tMatrixActions('saveAsTemplateDisabledMatrix')
            : tMatrixActions('saveAsTemplateTooltip'),
      onClick: () => setMatrixTemplateSaveDialogOpen(true),
      disabled: !matrix || matrix.length === 0 || !subject || !grade,
    },
    addContext: {
      icon: Plus,
      label: tContextsPanel('addContext'),
      tooltip: tActions('tooltips.addContext'),
      onClick: () => setContextCreateFormOpen(true),
    },
    fromLibrary: {
      icon: Library,
      label: tContextsPanel('fromLibrary'),
      tooltip: tActions('tooltips.fromLibrary'),
      onClick: () => setContextLibraryDialogOpen(true),
    },
  };

  const viewActions = VIEW_ACTIONS[mainView] ?? [];

  const sidebarContent = (
    <div className="space-y-6">
      <QuestionNavigator />

      <div className="space-y-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('actions.actions')}
        </div>

        {/* View-specific Actions */}
        {viewActions.length > 0 && (
          <>
            <div className="space-y-2">
              {viewActions.map((key) => {
                const action = actionRegistry[key];
                if (action.render) return <Fragment key={key}>{action.render()}</Fragment>;
                return <ActionButton key={key} {...action} />;
              })}
            </div>
            <div className="border-t pt-3" />
          </>
        )}

        {/* Save/Cancel Actions */}
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <LoadingButton
                onClick={onSave}
                loading={isSaving}
                loadingText={t('actions.saving')}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {t('actions.save')}
              </LoadingButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tActions('tooltips.save')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <LoadingButton
                onClick={onSaveAndExit}
                loading={isSaving}
                loadingText={t('actions.saving')}
                variant="outline"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {tActions('saveAndExit')}
              </LoadingButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tActions('tooltips.saveAndExit')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" disabled={isSaving} className="w-full" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                {t('actions.cancel')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tActions('tooltips.cancel')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 pb-4 lg:h-full lg:grid-cols-4">
      {/* Left/Main: Content Area (75% width on large screens) */}
      <div className="lg:col-span-3 lg:overflow-y-auto lg:pr-2">
        {mainView === 'info' ? (
          <AssignmentMetadataPanel />
        ) : mainView === 'questions' ? (
          <CurrentQuestionView />
        ) : mainView === 'matrix' ? (
          <MatrixBuilderPanel />
        ) : mainView === 'contexts' ? (
          <ContextsPanel />
        ) : mainView === 'contextGroup' ? (
          <ContextGroupPanel />
        ) : mainView === 'generateFromContext' ? (
          <GenerateFromContextManager />
        ) : mainView === 'questionsList' ? (
          <QuestionsListViewPanel assignment={{ questions, contexts, topics } as any} />
        ) : mainView === 'generateQuestions' ? (
          <GenerateQuestionsManager />
        ) : mainView === 'generateMatrix' ? (
          <GenerateMatrixManager />
        ) : mainView === 'fillMatrixGaps' && fillMatrixDraft ? (
          <FillMatrixGapsManager
            draft={fillMatrixDraft}
            onClose={() => {
              setMainView('matrix');
              setFillMatrixDraft(null);
            }}
            onQuestionsAdded={() => {
              setMainView('matrix');
              setFillMatrixDraft(null);
            }}
          />
        ) : null}
      </div>

      {/* Right: Sidebar (25% width on large screens, hidden on mobile) */}
      <div className="hidden space-y-6 lg:block lg:overflow-y-auto lg:pr-2">{sidebarContent}</div>

      {/* Mobile: Sheet drawer (trigger is in the page header) */}
      <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
        <SheetContent side="right" className="w-80 overflow-y-auto" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>{t('actions.actions')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{sidebarContent}</div>
        </SheetContent>
      </Sheet>

      {/* Matrix Template Library Dialog */}
      <MatrixTemplateLibraryDialog
        open={isMatrixTemplateLibraryDialogOpen}
        onOpenChange={setMatrixTemplateLibraryDialogOpen}
        currentGrade={grade}
        currentSubject={subject}
        onImport={importMatrixTemplate}
      />

      {/* Matrix Template Save Dialog */}
      <MatrixTemplateSaveDialog
        open={isMatrixTemplateSaveDialogOpen}
        onOpenChange={setMatrixTemplateSaveDialogOpen}
        matrix={matrix}
        topics={topics}
        subject={subject}
        grade={grade}
      />

      {/* Bulk Points Dialog - passes contextId when in contextGroup view */}
      <BulkPointsDialog
        open={isBulkPointsDialogOpen}
        onOpenChange={setBulkPointsDialogOpen}
        contextId={mainView === 'contextGroup' ? (currentContextId ?? undefined) : undefined}
      />
    </div>
  );
};

type ActionKey =
  | 'addQuestion'
  | 'generate'
  | 'fromBank'
  | 'shuffle'
  | 'bulkPoints'
  | 'generateFromContext'
  | 'addTopic'
  | 'generateMatrix'
  | 'fillMatrixGaps'
  | 'templateLibrary'
  | 'saveAsTemplate'
  | 'addContext'
  | 'fromLibrary';

type ActionConfig = {
  icon: LucideIcon;
  label: string;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  render?: () => ReactNode;
};

const VIEW_ACTIONS: Record<string, ActionKey[]> = {
  info: ['addQuestion', 'generate', 'fromBank', 'shuffle', 'bulkPoints'],
  questions: ['addQuestion', 'generate', 'fromBank'],
  questionsList: ['addQuestion', 'generate', 'fromBank', 'shuffle', 'bulkPoints'],
  generateQuestions: ['addQuestion'],
  fillMatrixGaps: ['addQuestion', 'generate', 'fromBank', 'shuffle', 'bulkPoints'],
  contextGroup: ['addQuestion', 'fromBank', 'bulkPoints', 'shuffle', 'generateFromContext'],
  matrix: ['addTopic', 'generateMatrix', 'fillMatrixGaps', 'templateLibrary', 'saveAsTemplate'],
  generateMatrix: ['addTopic'],
  contexts: ['addContext', 'fromLibrary'],
  generateFromContext: [],
};

const ActionButton = ({ icon: Icon, label, tooltip, onClick, disabled }: Omit<ActionConfig, 'render'>) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onClick}
        disabled={disabled}
        className="w-full"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);
