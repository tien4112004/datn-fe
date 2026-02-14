import React from 'react';
import { useAIMindmapContext } from '../../hooks/ai/useAIMindmapContext';
import { SingleNodePanel } from './contexts/SingleNodePanel';
import { SameBranchPanel } from './contexts/SameBranchPanel';
import { NoSelectionState } from './contexts/NoSelectionState';
import { CrossBranchMessage } from './contexts/CrossBranchMessage';

/**
 * Main AI Modification Panel for Mindmap
 * Renders different UI based on node selection context
 */
export function AIMindmapPanel(): React.ReactElement {
  const context = useAIMindmapContext();

  switch (context.type) {
    case 'no-selection':
      return <NoSelectionState />;

    case 'single-node':
      return <SingleNodePanel context={context} />;

    case 'same-branch':
      return <SameBranchPanel context={context} />;

    case 'cross-branch':
      return <CrossBranchMessage context={context} />;

    default:
      return <NoSelectionState />;
  }
}

export default AIMindmapPanel;
