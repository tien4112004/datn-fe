import MindMap from './components/Mindmap';
import { MindmapProvider } from './context/MindmapContext';

const MindmapPage = () => {
  return (
    <MindmapProvider>
      <MindMap />
    </MindmapProvider>
  );
};

export default { MindmapPage };
