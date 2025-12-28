import { QuestionsEditorPanel } from './QuestionsEditorPanel';
import { AssignmentBasicInfo } from './AssignmentBasicInfo';
import { AssessmentMatrixPanel } from './AssessmentMatrixPanel';

export const AssignmentEditorLayout = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left/Center: Questions Editor (2/3 width on large screens) */}
      <div className="lg:col-span-2">
        <QuestionsEditorPanel />
      </div>

      {/* Right: Assignment Info + Assessment Matrix (1/3 width on large screens) */}
      <div className="space-y-6">
        {/* Assignment Info - Top */}
        <AssignmentBasicInfo />

        {/* Assessment Matrix - Bottom */}
        <AssessmentMatrixPanel />
      </div>
    </div>
  );
};
