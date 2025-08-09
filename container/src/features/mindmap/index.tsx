import { ReactFlowProvider } from '@xyflow/react';
import MindMap from './components/Mindmap';
import { MindmapProvider } from './context/MindmapContext';

const MindmapPage = () => {
  return (
    <ReactFlowProvider>
      <MindmapProvider>
        <MindMap />
      </MindmapProvider>
    </ReactFlowProvider>
  );
};

export default { MindmapPage };
