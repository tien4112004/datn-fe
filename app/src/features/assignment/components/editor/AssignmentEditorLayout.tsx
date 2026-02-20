import { useState } from 'react';
import { Save, Wand2, Database, Plus, Library, Sparkles, Shuffle, ListChecks, LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@ui/button';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { CurrentQuestionView } from './questions/CurrentQuestionView';
import { AssignmentMetadataPanel } from './metadata/AssignmentMetadataPanel';
import { MatrixBuilderPanel } from './matrix/MatrixBuilderPanel';
import { ContextsPanel } from './contexts/ContextsPanel';
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
}

export const AssignmentEditorLayout = ({
  onCancel,
  onSave,
  onSaveAndExit,
  isSaving,
}: AssignmentEditorLayoutProps) => {
  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);
  const setContextCreateFormOpen = useAssignmentEditorStore((state) => state.setContextCreateFormOpen);
  const setContextLibraryDialogOpen = useAssignmentEditorStore((state) => state.setContextLibraryDialogOpen);
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

  const handleFillMatrixGaps = async () => {
    // Validate matrix exists and has requirements
    if (!matrix || matrix.length === 0) {
      toast.error(String(tFillGaps('errors.noMatrix')));
      return;
    }

    if (!matrix.some((cell) => cell.requiredCount > 0)) {
      toast.error(String(tFillGaps('errors.noRequirements')));
      return;
    }

    if (!grade || !subject) {
      toast.error(String(tFillGaps('errors.missingMetadata')));
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
      const errorMessage = err instanceof Error ? err.message : String(tFillGaps('errors.detectionFailed'));
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
    toast.success(String(t('toasts.questionsShuffled')));
  };

  return (
    <div className="grid grid-cols-1 gap-6 pb-4 lg:h-[calc(100vh-8rem)] lg:grid-cols-4">
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

      {/* Right: Sidebar (25% width on large screens) */}
      <div className="space-y-6 lg:overflow-y-auto lg:pr-2">
        {/* Navigation */}
        <QuestionNavigator />

        <div className="space-y-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('actions.actions')}
          </div>

          {/* Question Actions - Only show when not in matrix/contexts/generateMatrix view */}
          {mainView !== 'matrix' && mainView !== 'contexts' && mainView !== 'generateMatrix' && (
            <>
              <div className="space-y-2">
                <AddQuestionButton className="w-full" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMainView('generateQuestions')}
                      className="w-full"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      {tToolbar('generate')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.generate')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setQuestionBankOpen(true)}
                      className="w-full"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      {tToolbar('fromBank')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.fromBank')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleShuffleQuestions}
                      disabled={questions.length < 2}
                      className="w-full"
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      {tToolbar('shuffleQuestions')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.shuffleQuestions')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setBulkPointsDialogOpen(true)}
                      disabled={questions.length === 0}
                      className="w-full"
                    >
                      <ListChecks className="mr-2 h-4 w-4" />
                      {tToolbar('bulkPoints')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.bulkPoints')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Divider */}
              <div className="border-t pt-3" />
            </>
          )}

          {/* Matrix Actions - Show in matrix and generateMatrix views */}
          {(mainView === 'matrix' || mainView === 'generateMatrix') && (
            <>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('matrix.addTopic'));
                      }}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('matrixEditor.addTopic')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('matrixBuilder.tooltips.addTopic')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMainView('generateMatrix')}
                      className="w-full"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      {t('matrixBuilder.generateMatrix')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.generateMatrix')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleFillMatrixGaps}
                      disabled={isFillMatrixLoading}
                      className="w-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {String(t('actions.fillMatrixGaps'))}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{String(t('actions.tooltips.fillMatrixGaps'))}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMatrixTemplateLibraryDialogOpen(true)}
                      disabled={!subject || !grade}
                      className="w-full"
                    >
                      <Library className="mr-2 h-4 w-4" />
                      {tMatrixActions('templateLibrary')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {!subject || !grade
                        ? tMatrixActions('templateLibraryDisabled')
                        : tMatrixActions('templateLibraryTooltip')}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMatrixTemplateSaveDialogOpen(true)}
                      disabled={!matrix || matrix.length === 0 || !subject || !grade}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {tMatrixActions('saveAsTemplate')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {!subject || !grade
                        ? tMatrixActions('saveAsTemplateDisabledMetadata')
                        : !matrix || matrix.length === 0
                          ? tMatrixActions('saveAsTemplateDisabledMatrix')
                          : tMatrixActions('saveAsTemplateTooltip')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Divider */}
              <div className="border-t pt-3" />
            </>
          )}

          {/* Context Actions - Only show in contexts view */}
          {mainView === 'contexts' && (
            <>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setContextCreateFormOpen(true)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {tContextsPanel('addContext')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.addContext')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setContextLibraryDialogOpen(true)}
                      className="w-full"
                    >
                      <Library className="mr-2 h-4 w-4" />
                      {tContextsPanel('fromLibrary')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tActions('tooltips.fromLibrary')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Divider */}
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
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  className="w-full"
                  onClick={onCancel}
                >
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

      {/* Bulk Points Dialog */}
      <BulkPointsDialog open={isBulkPointsDialogOpen} onOpenChange={setBulkPointsDialogOpen} />
    </div>
  );
};
