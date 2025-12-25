import { useReactFlow } from '@xyflow/react';
import { CustomControls, CustomControlButton } from '../controls/CustomControls';
import { Move, MousePointer2, Maximize2, Minimize2, Eye, Edit, ZoomIn, ZoomOut, Scan } from 'lucide-react';
import { useResponsiveBreakpoint } from '@/shared/hooks';

interface MindmapControlsProps {
  isPanOnDrag: boolean;
  isPresenterMode: boolean;
  isFullscreen: boolean;
  onTogglePanOnDrag: () => void;
  onToggleFullscreen: () => void;
  onTogglePresenterMode: () => void;
}

const MindmapControls = ({
  isPanOnDrag,
  isPresenterMode,
  isFullscreen,
  onTogglePanOnDrag,
  onToggleFullscreen,
  onTogglePresenterMode,
}: MindmapControlsProps) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isMobile } = useResponsiveBreakpoint();

  // Use larger icons on mobile/tablet for better touch targets
  const iconSize = isMobile ? 14 : 16;

  return (
    <CustomControls>
      {!isPresenterMode && (
        <CustomControlButton
          onClick={onTogglePanOnDrag}
          title={isPanOnDrag ? 'Switch to Selection Mode' : 'Switch to Pan Mode'}
        >
          {isPanOnDrag ? <MousePointer2 size={iconSize} /> : <Move size={iconSize} />}
        </CustomControlButton>
      )}
      <CustomControlButton onClick={() => zoomIn()} title="Zoom In">
        <ZoomIn size={iconSize} />
      </CustomControlButton>
      <CustomControlButton onClick={() => zoomOut()} title="Zoom Out">
        <ZoomOut size={iconSize} />
      </CustomControlButton>
      <CustomControlButton onClick={() => fitView()} title="Fit View">
        <Scan size={iconSize} />
      </CustomControlButton>
      <CustomControlButton
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={iconSize} /> : <Maximize2 size={iconSize} />}
      </CustomControlButton>
      <CustomControlButton
        onClick={onTogglePresenterMode}
        title={isPresenterMode ? 'Disable Presenter Mode' : 'Enable Presenter Mode'}
      >
        {isPresenterMode ? <Edit size={iconSize} /> : <Eye size={iconSize} />}
      </CustomControlButton>
    </CustomControls>
  );
};

export default MindmapControls;
