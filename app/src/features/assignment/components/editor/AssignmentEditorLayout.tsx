import { QuestionsEditorPanel } from './QuestionsEditorPanel';
import { AssignmentMetadataPanel } from './AssignmentMetadataPanel';
import { QuestionNavigator } from './QuestionNavigator';
import { AssessmentMatrixPanel } from './AssessmentMatrixPanel';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';

export const AssignmentEditorLayout = () => {
  const mainView = useAssignmentEditorStore((state) => state.mainView);

  return (
    <div className="grid grid-cols-1 gap-6 pb-4 lg:grid-cols-4">
      {/* Left/Main: Content Area (75% width on large screens) */}
      <div className="lg:col-span-3">
        {mainView === 'info' ? <AssignmentMetadataPanel /> : <QuestionsEditorPanel />}
      </div>

      {/* Right: Sidebar (25% width on large screens) */}
      <div className="space-y-6 pb-4">
        {/* Navigation */}
        <QuestionNavigator />

        {/* Assessment Matrix */}
        <AssessmentMatrixPanel />
      </div>
    </div>
  );
};
