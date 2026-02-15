import React, { useMemo } from 'react';
import { useMindmapMetadata } from '../../hooks/useMindmapMetadata';
import { useCoreStore } from '../../stores';
import { CrossBranchMessage } from './contexts/CrossBranchMessage';
import { NoSelectionState } from './contexts/NoSelectionState';
import { SameBranchPanel } from './contexts/SameBranchPanel';
import { SingleNodePanel } from './contexts/SingleNodePanel';

interface AIMindmapPanelProps {
  mindmapId: string;
}

/**
 * Main AI Modification Panel for Mindmap
 * Renders different UI based on node selection context
 */
export function AIMindmapPanel({ mindmapId }: AIMindmapPanelProps): React.ReactElement {
  // Subscribe to selectedCount and nodes to detect any selection changes
  const selectedCount = useCoreStore((state) => state.selectedNodeIds.size);
  const nodes = useCoreStore((state) => state.nodes);

  // Fetch mindmap metadata for AI context enrichment
  const { data: metadata, isLoading: isMetadataLoading } = useMindmapMetadata(mindmapId);

  // Compute context when selection or node data changes
  const context = useMemo(() => {
    return useCoreStore.getState().getAIContext();
  }, [selectedCount, nodes]);

  switch (context.type) {
    case 'no-selection':
      return <NoSelectionState />;

    case 'single-node':
      return <SingleNodePanel context={context} metadata={metadata} isMetadataLoading={isMetadataLoading} />;

    case 'same-branch':
      return <SameBranchPanel context={context} metadata={metadata} isMetadataLoading={isMetadataLoading} />;

    case 'cross-branch':
      return <CrossBranchMessage context={context} />;

    default:
      return <NoSelectionState />;
  }
}

export default AIMindmapPanel;
