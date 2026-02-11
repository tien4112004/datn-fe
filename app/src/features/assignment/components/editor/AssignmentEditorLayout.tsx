import { Save, Wand2, Database, Plus, Library, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CurrentQuestionView } from './CurrentQuestionView';
import { AssignmentMetadataPanel } from './AssignmentMetadataPanel';
import { MatrixBuilderPanel } from './MatrixBuilderPanel';
import { ContextsPanel } from './ContextsPanel';
import { QuestionNavigator } from './QuestionNavigator';
import { AddQuestionButton } from './AddQuestionButton';
import { QuestionListDialog } from './QuestionListDialog';
import { QuestionsListViewPanel } from '../viewer/QuestionsListViewPanel';
import { GenerateQuestionsManager } from './GenerateQuestionsManager';
import { GenerateMatrixManager } from './GenerateMatrixManager';
import { FillMatrixGapsManager } from './FillMatrixGapsManager';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface AssignmentEditorLayoutProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AssignmentEditorLayout = ({ onSave, isSaving }: AssignmentEditorLayoutProps) => {
  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);
  const setContextCreateFormOpen = useAssignmentEditorStore((state) => state.setContextCreateFormOpen);
  const setContextLibraryDialogOpen = useAssignmentEditorStore((state) => state.setContextLibraryDialogOpen);
  const questions = useAssignmentFormStore((state) => state.questions);
  const contexts = useAssignmentFormStore((state) => state.contexts);
  const topics = useAssignmentFormStore((state) => state.topics);
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });
  const { t: tToolbar } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const { t: tContextsPanel } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.contextsPanel' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.actions' });

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
        ) : mainView === 'fillMatrixGaps' ? (
          <FillMatrixGapsManager
            onClose={() => setMainView('matrix')}
            onQuestionsAdded={() => {
              setMainView('matrix');
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
                      onClick={() => setMainView('fillMatrixGaps')}
                      className="w-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('actions.fillMatrixGaps')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('actions.tooltips.fillMatrixGaps')}</p>
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
          </div>
        </div>
      </div>

      {/* Question List Dialog */}
      <QuestionListDialog />
    </div>
  );
};
