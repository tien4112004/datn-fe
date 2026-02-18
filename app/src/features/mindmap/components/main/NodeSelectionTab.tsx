import { Trash2, Copy, Plus, Palette, GitBranch, MousePointerClick, ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Checkbox } from '@ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useNodeSelection } from '../../hooks/useNodeSelection';
import { useNodeOperationsStore, useCoreStore, useLayoutStore, useNodeManipulationStore } from '../../stores';
import ColorPickerControl from '../controls/ColorPickerControl';
import { useCallback, useMemo } from 'react';
import { SIDE, MINDMAP_TYPES, LAYOUT_TYPE, PATH_TYPES } from '../../types';
import type { LayoutType, PathType } from '../../types';
import { getAllDescendantNodes, DEFAULT_LAYOUT_TYPE } from '../../services/utils';
import { BezierIcon, SmoothStepIcon, StraightIcon } from '../ui/icon';

interface NodeSelectionTabProps {
  className?: string;
}

// Stable Selectors
const selectLayoutType = (state: any) => {
  const firstNodeId = state.selectedNodeIds.values().next().value;
  if (!firstNodeId) return DEFAULT_LAYOUT_TYPE;

  const rootId = state.nodeToRootMap.get(firstNodeId);
  return (rootId && state.rootLayoutTypeMap.get(rootId)) || DEFAULT_LAYOUT_TYPE;
};

const selectIsAutoLayoutEnabled = (state: any) => {
  const firstNodeId = state.selectedNodeIds.values().next().value;
  if (!firstNodeId) return false;

  const rootId = state.nodeToRootMap.get(firstNodeId);
  if (!rootId) return false;

  const rootNode = state.nodes.find((n: any) => n.id === rootId);
  return Boolean(rootNode?.data?.forceLayout ?? false);
};

const NodeSelectionTab = memo(({ className }: NodeSelectionTabProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const {
    selectedNodes,
    selectedCount,
    hasSelection,
    isSingleSelection,
    isMultiSelection,
    firstSelectedNode,
    deleteSelected,
    copyToClipboard,
    deselectAll,
  } = useNodeSelection();

  // Actions only - no state subscriptions to avoid rerenders
  const setNodes = useCoreStore((state) => state.setNodes);
  const updateNodeData = useNodeOperationsStore((state) => state.updateNodeData);
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
  const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
  const updateLayout = useLayoutStore((state) => state.updateLayout);
  const setLayoutType = useLayoutStore((state) => state.setLayoutType);
  const setAutoLayoutEnabled = useLayoutStore((state) => state.setAutoLayoutEnabled);
  const getSpacingProfile = useLayoutStore((state) => state.getSpacingProfile);
  const setSpacingProfile = useLayoutStore((state) => state.setSpacingProfile);
  const updateSubtreeEdgePathType = useNodeManipulationStore((state) => state.updateSubtreeEdgePathType);
  const updateSubtreeEdgeColor = useNodeManipulationStore((state) => state.updateSubtreeEdgeColor);

  // Get layout data from root node using cached maps
  const layoutType = useCoreStore(selectLayoutType);

  // Get auto layout setting from first selected node's root
  const isAutoLayoutEnabled: boolean = useCoreStore(selectIsAutoLayoutEnabled);
  const spacingProfile = getSpacingProfile();

  // Get the background color of the first selected node (for single selection styling)
  const currentColor = (firstSelectedNode?.data?.backgroundColor as string) || '#ffffff';

  // Check if the selected node is a root node
  const isRootNode = useMemo(() => {
    return firstSelectedNode?.type === MINDMAP_TYPES.ROOT_NODE;
  }, [firstSelectedNode]);

  // Get the edge color for root node
  const currentEdgeColor = useMemo(() => {
    if (!isRootNode || !firstSelectedNode) return '#3b82f6';
    return (firstSelectedNode?.data?.edgeColor as string) || '#3b82f6';
  }, [isRootNode, firstSelectedNode]);

  // Get the current path type for root node
  const currentPathType = useMemo(() => {
    if (!isRootNode || !firstSelectedNode) return PATH_TYPES.SMOOTHSTEP;
    return (firstSelectedNode?.data?.pathType as PathType) || PATH_TYPES.SMOOTHSTEP;
  }, [isRootNode, firstSelectedNode]);

  // Get descendant count for single selection
  const descendantCount = useMemo(() => {
    if (!isSingleSelection || !firstSelectedNode) return 0;
    const nodes = useCoreStore.getState().nodes;
    return getAllDescendantNodes(firstSelectedNode.id, nodes).length;
  }, [isSingleSelection, firstSelectedNode]);

  /**
   * Handle spacing profile change
   */
  const handleSpacingProfileChange = useCallback(
    (profile: string) => {
      setSpacingProfile(profile as 'COMPACT' | 'DEFAULT' | 'SPACIOUS');
      if (isAutoLayoutEnabled) {
        updateLayout();
      }
    },
    [setSpacingProfile, isAutoLayoutEnabled, updateLayout]
  );

  /**
   * Layout type options for root node layout section
   */
  const LAYOUT_OPTIONS = useMemo(
    () => [
      { type: LAYOUT_TYPE.HORIZONTAL_BALANCED, label: t('toolbar.layout.horizontalBalanced') },
      { type: LAYOUT_TYPE.VERTICAL_BALANCED, label: t('toolbar.layout.verticalBalanced') },
      { type: LAYOUT_TYPE.RIGHT_ONLY, label: t('toolbar.layout.rightOnly') },
      { type: LAYOUT_TYPE.LEFT_ONLY, label: t('toolbar.layout.leftOnly') },
      { type: LAYOUT_TYPE.BOTTOM_ONLY, label: t('toolbar.layout.bottomOnly') },
      { type: LAYOUT_TYPE.TOP_ONLY, label: t('toolbar.layout.topOnly') },
    ],
    [t]
  );

  const SPACING_OPTIONS = useMemo(
    () => [
      { value: 'COMPACT' as const, label: t('toolbar.layout.spacingCompact') },
      { value: 'DEFAULT' as const, label: t('toolbar.layout.spacingDefault') },
      { value: 'SPACIOUS' as const, label: t('toolbar.layout.spacingSpacious') },
    ],
    [t]
  );

  const handleLayoutTypeChange = useCallback(
    (type: LayoutType) => {
      setLayoutType(type);
      if (isAutoLayoutEnabled) {
        updateLayout(type);
      }
    },
    [setLayoutType, isAutoLayoutEnabled, updateLayout]
  );

  const handleAutoLayoutChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (typeof checked === 'boolean') {
        setAutoLayoutEnabled(checked);
        if (checked) {
          updateLayout();
        }
      }
    },
    [setAutoLayoutEnabled, updateLayout]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      // Apply color to all selected nodes
      selectedNodes.forEach((node) => {
        updateNodeData(node.id, { backgroundColor: color });
      });
    },
    [selectedNodes, updateNodeData]
  );

  const handleEdgePathTypeChange = useCallback(
    (pathType: PathType) => {
      if (!firstSelectedNode || !isRootNode) return;
      updateSubtreeEdgePathType(firstSelectedNode.id, pathType);
    },
    [firstSelectedNode, isRootNode, updateSubtreeEdgePathType]
  );

  const handleEdgeColorChange = useCallback(
    (color: string) => {
      if (!firstSelectedNode || !isRootNode) return;
      updateSubtreeEdgeColor(firstSelectedNode.id, color);
    },
    [firstSelectedNode, isRootNode, updateSubtreeEdgeColor]
  );

  const handleAddChild = useCallback(() => {
    if (!firstSelectedNode) return;

    // Determine the side based on the parent's side
    const side = firstSelectedNode.data.side === SIDE.LEFT ? SIDE.LEFT : SIDE.RIGHT;

    addChildNode(
      firstSelectedNode,
      {
        x: firstSelectedNode.position.x + 200,
        y: firstSelectedNode.position.y,
      },
      side,
      MINDMAP_TYPES.TEXT_NODE
    );
  }, [firstSelectedNode, addChildNode]);

  // Select all descendant nodes of the selected node
  const handleSelectDescendants = useCallback(() => {
    if (!firstSelectedNode) return;

    const nodes = useCoreStore.getState().nodes;
    const descendants = getAllDescendantNodes(firstSelectedNode.id, nodes);
    const descendantIds = new Set([firstSelectedNode.id, ...descendants.map((n) => n.id)]);

    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        selected: descendantIds.has(node.id),
      }))
    );
  }, [firstSelectedNode, setNodes]);

  // Layout subtree for the selected node
  const handleLayoutSubtree = useCallback(() => {
    if (!firstSelectedNode) return;
    updateSubtreeLayout(firstSelectedNode.id, layoutType);
  }, [firstSelectedNode, updateSubtreeLayout, layoutType]);

  // No selection state
  if (!hasSelection) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 rounded-full bg-gray-100 p-3">
            <Palette className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t('toolbar.selection.noSelection')}</p>
          <p className="mt-1 text-xs text-gray-400">{t('toolbar.selection.selectNodeHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 1. Selection Info */}
      <div className="mb-4 rounded-md bg-blue-50 px-3 py-2">
        <p className="text-sm font-medium text-blue-700">
          {t('toolbar.selection.selectedCount', { count: selectedCount })}
        </p>
        {isSingleSelection && firstSelectedNode && (
          <>
            <p className="mt-0.5 truncate text-xs text-blue-600">
              {(typeof firstSelectedNode.data.content === 'string'
                ? firstSelectedNode.data.content.replace(/<[^>]*>/g, '').slice(0, 30)
                : '') || 'Untitled'}
            </p>
            {isRootNode && (
              <span className="mt-1 inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                {t('toolbar.selection.rootNode')}
              </span>
            )}
          </>
        )}
        {isMultiSelection && (
          <p className="mt-0.5 text-xs text-blue-600">{t('toolbar.selection.multiSelectHint')}</p>
        )}
      </div>

      {/* 2. Actions Section */}
      <div className="space-y-2">
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t('toolbar.selection.actions')}
        </h3>

        <div className="space-y-2">
          {/* Single Selection Actions */}
          {isSingleSelection && (
            <>
              {/* Add Child Node */}
              <Button
                onClick={handleAddChild}
                variant="outline"
                size="sm"
                className="w-full justify-start transition-colors hover:bg-gray-100"
              >
                <Plus size={16} />
                {t('toolbar.selection.addChild')}
              </Button>

              {/* Select All Descendants */}
              {descendantCount > 0 && (
                <Button
                  onClick={handleSelectDescendants}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start transition-colors hover:bg-gray-100"
                >
                  <MousePointerClick size={16} />
                  {t('toolbar.selection.selectDescendants', { count: descendantCount })}
                </Button>
              )}

              {/* Layout Subtree - always show for any node */}
              <Button
                onClick={handleLayoutSubtree}
                variant="outline"
                size="sm"
                className="w-full justify-start transition-colors hover:bg-gray-100"
              >
                <GitBranch size={16} />
                {t('toolbar.selection.layoutSubtree')}
              </Button>
            </>
          )}

          {/* Copy */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="w-full justify-start transition-colors hover:bg-gray-100"
          >
            <Copy size={16} />
            {t('toolbar.selection.copy')}
          </Button>

          {/* Delete */}
          <Button
            onClick={deleteSelected}
            variant="destructive"
            size="sm"
            className="w-full justify-start transition-colors"
          >
            <Trash2 size={16} />
            {t('toolbar.selection.delete')}
          </Button>
        </div>
      </div>

      {/* 3. Styling Section (Background and Edge) */}
      <div className="mt-4 space-y-3">
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t('toolbar.selection.styling')}
        </h3>

        {/* Background Color */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-600">{t('toolbar.selection.backgroundColor')}</Label>
          <ColorPickerControl hex={currentColor} setHex={handleColorChange} hasPicker />
        </div>

        {/* Edge Style Section - only for root nodes */}
        {isRootNode && (
          <>
            <div className="border-t border-gray-200 pt-3">
              <Label className="mb-2 block text-xs font-medium text-gray-600">
                {t('toolbar.selection.edgeStyle')}
              </Label>

              {/* Edge Path Type */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">{t('toolbar.selection.edgeType')}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        {currentPathType === PATH_TYPES.SMOOTHSTEP && <SmoothStepIcon />}
                        {currentPathType === PATH_TYPES.BEZIER && <BezierIcon />}
                        {currentPathType === PATH_TYPES.STRAIGHT && <StraightIcon />}
                        <span>
                          {currentPathType === PATH_TYPES.SMOOTHSTEP &&
                            t('toolbar.selection.edgeTypes.smoothStep')}
                          {currentPathType === PATH_TYPES.BEZIER && t('toolbar.selection.edgeTypes.bezier')}
                          {currentPathType === PATH_TYPES.STRAIGHT &&
                            t('toolbar.selection.edgeTypes.straight')}
                        </span>
                      </div>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleEdgePathTypeChange(PATH_TYPES.SMOOTHSTEP)}
                      className={currentPathType === PATH_TYPES.SMOOTHSTEP ? 'bg-gray-100' : ''}
                    >
                      <SmoothStepIcon />
                      <span className="ml-2">{t('toolbar.selection.edgeTypes.smoothStep')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEdgePathTypeChange(PATH_TYPES.BEZIER)}
                      className={currentPathType === PATH_TYPES.BEZIER ? 'bg-gray-100' : ''}
                    >
                      <BezierIcon />
                      <span className="ml-2">{t('toolbar.selection.edgeTypes.bezier')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEdgePathTypeChange(PATH_TYPES.STRAIGHT)}
                      className={currentPathType === PATH_TYPES.STRAIGHT ? 'bg-gray-100' : ''}
                    >
                      <StraightIcon />
                      <span className="ml-2">{t('toolbar.selection.edgeTypes.straight')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Edge Color */}
              <div className="mt-2 flex items-center justify-between">
                <Label className="text-xs text-gray-500">{t('toolbar.selection.edgeColor')}</Label>
                <ColorPickerControl hex={currentEdgeColor} setHex={handleEdgeColorChange} hasPicker />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Layout Section - only for root nodes */}
      {isSingleSelection && isRootNode && (
        <div className="mt-4 space-y-3">
          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
            {t('toolbar.sections.layout')}
          </h3>

          {/* Force Auto Layout Checkbox */}
          <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
            <Checkbox
              id="auto-layout-selection"
              checked={isAutoLayoutEnabled}
              onCheckedChange={handleAutoLayoutChange}
              className="mt-0.5"
            />
            <Label
              htmlFor="auto-layout-selection"
              className="flex-1 cursor-pointer text-sm font-medium text-gray-700"
            >
              {t('toolbar.layout.forceAutoLayout')}
            </Label>
          </div>

          {/* Layout Type Dropdown */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">{t('toolbar.layout.layoutType')}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {LAYOUT_OPTIONS.find((opt) => opt.type === layoutType)?.label || 'None'}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {LAYOUT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.type}
                    onClick={() => handleLayoutTypeChange(option.type)}
                    className={layoutType === option.type ? 'bg-gray-100' : ''}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Spacing Profile */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">{t('toolbar.layout.spacing')}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {SPACING_OPTIONS.find((opt) => opt.value === spacingProfile)?.label || spacingProfile}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {SPACING_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSpacingProfileChange(option.value)}
                    className={spacingProfile === option.value ? 'bg-gray-100' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Manual Layout Button */}
          <Button
            variant="outline"
            onClick={() => updateLayout()}
            size="sm"
            title={t('toolbar.tooltips.applyLayout')}
            className="w-full transition-colors hover:bg-gray-100"
          >
            {t('toolbar.actions.applyLayout')}
          </Button>
        </div>
      )}

      {/* 5. Unselect Button */}
      <div className="mt-4">
        <Button
          onClick={deselectAll}
          variant="ghost"
          size="sm"
          className="w-full text-gray-500 hover:text-gray-700"
        >
          {t('toolbar.selection.deselectAll')}
        </Button>
      </div>
    </div>
  );
});

NodeSelectionTab.displayName = 'NodeSelectionTab';

export default NodeSelectionTab;
