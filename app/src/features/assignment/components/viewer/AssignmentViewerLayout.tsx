import type { Assignment } from '../../types';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import { AssignmentMetadataViewPanel } from './AssignmentMetadataViewPanel';
import { QuestionsViewPanel } from './QuestionsViewPanel';
import { MatrixViewPanel } from './MatrixViewPanel';
import { QuestionViewNavigator } from './QuestionViewNavigator';
import { ViewerActionsPanel } from './ViewerActionsPanel';

interface AssignmentViewerLayoutProps {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: () => void;
}

export const AssignmentViewerLayout = ({ assignment, onEdit, onDelete }: AssignmentViewerLayoutProps) => {
  const mainView = useAssignmentViewerStore((state) => state.mainView);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Main Content Area (75% width on large screens) */}
      <div className="lg:col-span-3 lg:overflow-y-auto lg:pr-2">
        {mainView === 'info' && <AssignmentMetadataViewPanel assignment={assignment} />}
        {mainView === 'questions' && <QuestionsViewPanel assignment={assignment} />}
        {mainView === 'matrix' && <MatrixViewPanel assignment={assignment} />}
      </div>

      {/* Sidebar (25% width on large screens) */}
      <div className="space-y-6 lg:overflow-y-auto lg:pr-2">
        <ViewerActionsPanel onEdit={onEdit} onDelete={onDelete} />
        <QuestionViewNavigator assignment={assignment} />
      </div>
    </div>
  );
};
