import { Save, Wand2, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { QuestionsEditorPanel } from './QuestionsEditorPanel';
import { AssignmentMetadataPanel } from './AssignmentMetadataPanel';
import { QuestionNavigator } from './QuestionNavigator';
import { AssessmentMatrixPanel } from './AssessmentMatrixPanel';
import { AddQuestionButton } from './AddQuestionButton';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';

interface AssignmentEditorLayoutProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AssignmentEditorLayout = ({ onSave, isSaving }: AssignmentEditorLayoutProps) => {
  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });
  const { t: tToolbar } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });

  return (
    <div className="grid grid-cols-1 gap-6 pb-4 lg:grid-cols-4">
      {/* Left/Main: Content Area (75% width on large screens) */}
      <div className="lg:col-span-3">
        {mainView === 'info' ? <AssignmentMetadataPanel /> : <QuestionsEditorPanel />}
      </div>

      {/* Right: Sidebar (25% width on large screens) */}
      <div className="space-y-6">
        <div className="space-y-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</div>

          {/* Question Actions */}
          <div className="space-y-2">
            <AddQuestionButton className="w-full" />
            <Button type="button" size="sm" variant="outline" disabled className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              {tToolbar('generate')}
            </Button>
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
          </div>

          {/* Divider */}
          <div className="border-t pt-3" />

          {/* Save/Cancel Actions */}
          <div className="space-y-2">
            <LoadingButton
              onClick={onSave}
              loading={isSaving}
              loadingText={t('actions.saving')}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {t('actions.save')}
            </LoadingButton>
          </div>
        </div>

        {/* Navigation */}
        <QuestionNavigator />

        {/* Assessment Matrix */}
        <AssessmentMatrixPanel />
      </div>
    </div>
  );
};
