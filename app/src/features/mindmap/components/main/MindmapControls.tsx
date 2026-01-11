import { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { CustomControls, CustomControlButton } from '../controls/CustomControls';
import { Move, MousePointer2, Maximize2, Minimize2, Eye, Edit, ZoomIn, ZoomOut, Scan } from 'lucide-react';
import { useResponsiveBreakpoint } from '@/shared/hooks';
import { useViewModeStore } from '../../stores';

interface MindmapControlsProps {
  isPanOnDrag: boolean;
  isPresenterMode: boolean;
  isFullscreen: boolean;
  onTogglePanOnDrag: () => void;
  onToggleFullscreen: () => void;
  onTogglePresenterMode: () => void;
}

const MindmapControls = memo(
  ({
    isPanOnDrag,
    isPresenterMode,
    isFullscreen,
    onTogglePanOnDrag,
    onToggleFullscreen,
    onTogglePresenterMode,
  }: MindmapControlsProps) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { isMobile } = useResponsiveBreakpoint();
    const isViewMode = useViewModeStore((state) => state.isViewMode);

    // Use larger icons on mobile/tablet for better touch targets
    const iconSize = isMobile ? 14 : 16;

    // Combined read-only state
    const isReadOnly = isPresenterMode || isViewMode;

    return (
      <CustomControls>
        {!isReadOnly && (
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
        {/* Only show Presenter Mode toggle if NOT in View Mode (View Mode is server-driven) */}
        {!isViewMode && (
          <CustomControlButton
            onClick={onTogglePresenterMode}
            title={isPresenterMode ? 'Disable Presenter Mode' : 'Enable Presenter Mode'}
          >
            {isPresenterMode ? <Edit size={iconSize} /> : <Eye size={iconSize} />}
          </CustomControlButton>
        )}
      </CustomControls>
    );
  }
);

export default MindmapControls;
