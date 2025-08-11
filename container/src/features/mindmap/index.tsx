import { ReactFlowProvider } from '@xyflow/react';
import MindMap from './components/Mindmap';

const MindmapPage = () => {
  return (
    <ReactFlowProvider>
      <MindMap />
    </ReactFlowProvider>
  );
};

export default { MindmapPage };
