import { Trash2, Copy, Plus, Palette, GitBranch, MousePointerClick, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useNodeSelection } from '../../hooks/useNodeSelection';
import { useNodeOperationsStore, useCoreStore, useLayoutStore } from '../../stores';
import ColorPickerControl from '../controls/ColorPickerControl';
import { useCallback, useMemo } from 'react';
import { SIDE, MINDMAP_TYPES, LAYOUT_TYPE } from '../../types';
import type { LayoutType } from '../../types';
import { getAllDescendantNodes } from '../../services/utils';

interface NodeSelectionTabProps {
  className?: string;
}

const NodeSelectionTab = ({ className }: NodeSelectionTabProps) => {
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

  const nodes = useCoreStore((state) => state.nodes);
  const setNodes = useCoreStore((state) => state.setNodes);
  const updateNodeData = useNodeOperationsStore((state) => state.updateNodeData);
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
  const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
  const updateLayoutWithType = useLayoutStore((state) => state.updateLayoutWithType);
  const layout = useLayoutStore((state) => state.layout);
  const layoutType = useLayoutStore((state) => state.layoutType);
  const setLayoutType = useLayoutStore((state) => state.setLayoutType);
  const isAutoLayoutEnabled = useLayoutStore((state) => state.isAutoLayoutEnabled);
  const setAutoLayoutEnabled = useLayoutStore((state) => state.setAutoLayoutEnabled);

  // Get the background color of the first selected node (for single selection styling)
  const currentColor = (firstSelectedNode?.data?.backgroundColor as string) || '#ffffff';

  // Check if the selected node is a root node
  const isRootNode = useMemo(() => {
    return firstSelectedNode?.type === MINDMAP_TYPES.ROOT_NODE;
  }, [firstSelectedNode]);

  // Get descendant count for single selection
  const descendantCount = useMemo(() => {
    if (!isSingleSelection || !firstSelectedNode) return 0;
    return getAllDescendantNodes(firstSelectedNode.id, nodes).length;
  }, [isSingleSelection, firstSelectedNode, nodes]);

  /**
   * Layout type options for root node layout section
   */
  const LAYOUT_OPTIONS: Array<{
    type: LayoutType;
    labelKey: string;
  }> = [
    { type: LAYOUT_TYPE.HORIZONTAL_BALANCED, labelKey: 'toolbar.layout.horizontalBalanced' },
    { type: LAYOUT_TYPE.VERTICAL_BALANCED, labelKey: 'toolbar.layout.verticalBalanced' },
    { type: LAYOUT_TYPE.RIGHT_ONLY, labelKey: 'toolbar.layout.rightOnly' },
    { type: LAYOUT_TYPE.LEFT_ONLY, labelKey: 'toolbar.layout.leftOnly' },
    { type: LAYOUT_TYPE.BOTTOM_ONLY, labelKey: 'toolbar.layout.bottomOnly' },
    { type: LAYOUT_TYPE.TOP_ONLY, labelKey: 'toolbar.layout.topOnly' },
  ];

  const getLayoutLabel = useCallback(
    (type: LayoutType): string => {
      const option = LAYOUT_OPTIONS.find((opt) => opt.type === type);
      if (option) {
        const translated = t(option.labelKey, { defaultValue: '' });
        if (translated && translated !== option.labelKey) {
          return translated;
        }
      }
      // Fallback labels
      switch (type) {
        case LAYOUT_TYPE.HORIZONTAL_BALANCED:
          return 'Horizontal Balanced';
        case LAYOUT_TYPE.VERTICAL_BALANCED:
          return 'Vertical Balanced';
        case LAYOUT_TYPE.RIGHT_ONLY:
          return 'Right Only';
        case LAYOUT_TYPE.LEFT_ONLY:
          return 'Left Only';
        case LAYOUT_TYPE.BOTTOM_ONLY:
          return 'Bottom Only';
        case LAYOUT_TYPE.TOP_ONLY:
          return 'Top Only';
        default:
          return 'None';
      }
    },
    [t]
  );

  const handleLayoutTypeChange = useCallback(
    (type: LayoutType) => {
      setLayoutType(type);
      if (isAutoLayoutEnabled) {
        updateLayoutWithType(type);
      }
    },
    [setLayoutType, isAutoLayoutEnabled, updateLayoutWithType]
  );

  const handleAutoLayoutChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (typeof checked === 'boolean') {
        setAutoLayoutEnabled(checked);
        if (checked) {
          updateLayoutWithType();
        }
      }
    },
    [setAutoLayoutEnabled, updateLayoutWithType]
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

    const descendants = getAllDescendantNodes(firstSelectedNode.id, nodes);
    const descendantIds = new Set([firstSelectedNode.id, ...descendants.map((n) => n.id)]);

    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        selected: descendantIds.has(node.id),
      }))
    );
  }, [firstSelectedNode, nodes, setNodes]);

  // Layout subtree for the selected node
  const handleLayoutSubtree = useCallback(() => {
    if (!firstSelectedNode) return;
    updateSubtreeLayout(firstSelectedNode.id, layout);
  }, [firstSelectedNode, updateSubtreeLayout, layout]);

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
      {/* Selection Info */}
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

      {/* Single Selection Actions */}
      {isSingleSelection && (
        <div className="space-y-2">
          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
            {t('toolbar.selection.nodeActions')}
          </h3>

          <div className="space-y-2">
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
          </div>
        </div>
      )}

      {/* Root Node Layout Options */}
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
                  {getLayoutLabel(layoutType)}
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
                      <span className="font-medium">{getLayoutLabel(option.type)}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Manual Layout Button */}
          <Button
            variant="outline"
            onClick={() => updateLayoutWithType()}
            size="sm"
            title={t('toolbar.tooltips.applyLayout')}
            className="w-full transition-colors hover:bg-gray-100"
          >
            {t('toolbar.actions.applyLayout')}
          </Button>
        </div>
      )}

      {/* Common Actions Section */}
      <div className={isSingleSelection ? 'mt-4 space-y-2' : 'space-y-2'}>
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t('toolbar.selection.actions')}
        </h3>

        <div className="space-y-2">
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

      {/* Styling Section */}
      <div className="mt-4 space-y-2">
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t('toolbar.selection.styling')}
        </h3>

        <div className="space-y-3">
          {/* Background Color */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-600">{t('toolbar.selection.backgroundColor')}</Label>
            <ColorPickerControl hex={currentColor} setHex={handleColorChange} hasPicker />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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
};

export default NodeSelectionTab;
