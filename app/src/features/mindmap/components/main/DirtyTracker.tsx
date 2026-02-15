import { memo } from 'react';
import { useMindmapDirtyTracking } from '../../hooks/useDirtyTracking';

interface DirtyTrackerProps {
  enabled: boolean;
}

export const DirtyTracker = memo(({ enabled }: DirtyTrackerProps) => {
  useMindmapDirtyTracking(enabled);
  return null;
});

DirtyTracker.displayName = 'DirtyTracker';
