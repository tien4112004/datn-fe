import { QuestionsEditorPanel } from './QuestionsEditorPanel';
import { AssignmentMetadataPanel } from './AssignmentMetadataPanel';
import { AssessmentMatrixPanel } from './AssessmentMatrixPanel';

export const AssignmentEditorLayout = () => {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left/Center: Questions Editor (2/3 width on large screens) */}
      <div className="lg:col-span-2">
        <QuestionsEditorPanel />
      </div>

      {/* Right: Assignment Info + Assessment Matrix (1/3 width on large screens) */}
      <div className="space-y-4">
        {/* Assignment Info - Top */}
        <AssignmentMetadataPanel />

        {/* Assessment Matrix - Bottom */}
        <AssessmentMatrixPanel />
      </div>
    </div>
  );
};
