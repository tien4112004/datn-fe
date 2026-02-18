import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import type { NodeProps } from '@xyflow/react';
import { Network, Workflow } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useCoreStore, useLayoutStore, useNodeManipulationStore, useNodeOperationsStore } from '../../stores';
import type { PathType, RootNode } from '../../types';
import { DRAGHANDLE, PATH_TYPES } from '../../types';
import { DEFAULT_LAYOUT_TYPE } from '../../services/utils';
import { BaseNodeContent } from '../ui/base-node';
import { BezierIcon, SmoothStepIcon, StraightIcon } from '../ui/icon';
import { BaseNodeBlock } from './BaseNode';

import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';
import { BaseNodeControl } from '../controls/BaseNodeControl';
import ColorPickerControl from '../controls/ColorPickerControl';
import { NodeRichTextContent } from '../ui/node-rich-text-content';

const RootNodeBlock = memo(
  ({ ...node }: NodeProps<RootNode>) => {
    const { data, selected: isSelected, dragging } = node;
    const { isReadOnly, canEdit } = useMindmapPermissionContext();

    // Root node IS the tree root, can directly look up its own layoutType
    const layoutType = useCoreStore((state) => state.rootLayoutTypeMap.get(node.id) || DEFAULT_LAYOUT_TYPE);

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
    const updateSubtreeEdgePathType = useNodeManipulationStore((state) => state.updateSubtreeEdgePathType);
    const updateSubtreeEdgeColor = useNodeManipulationStore((state) => state.updateSubtreeEdgeColor);
    const isLayouting = useLayoutStore((state) => state.isLayouting);

    const [hex, setHex] = useState<string>(data.edgeColor as string);

    const handleContentChange = useCallback(
      (content: string) => {
        updateNodeData(node.id, { content });
      },
      [node.id, updateNodeData]
    );

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layoutType);
    };

    const handlePathTypeChange = useCallback(
      (pathType: PathType) => {
        updateSubtreeEdgePathType(node.id, pathType);
      },
      [node.id, updateSubtreeEdgePathType]
    );

    const handleEdgeColorChange = useCallback(
      (edgeColor: string) => {
        updateSubtreeEdgeColor(node.id, edgeColor);
      },
      [node.id, updateSubtreeEdgeColor]
    );

    return (
      <BaseNodeBlock
        node={node}
        variant="root"
        className={DRAGHANDLE.CLASS}
        style={{ backgroundColor: data.backgroundColor as string }}
      >
        <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 px-2">
          {/* <div className={cn('flex-shrink-0 p-2 pr-0', DRAGHANDLE.CLASS)}>
            <GripVertical className={cn('h-6 w-5', isSelected ? 'opacity-100' : 'opacity-50')} />
          </div> */}

          <NodeRichTextContent
            content={data.content}
            isDragging={dragging}
            isLayouting={isLayouting}
            onContentChange={handleContentChange}
            minimalToolbar={true}
            isPresenterMode={isReadOnly}
            style={{
              minWidth: 'fit-content',
              minHeight: 'fit-content',
              // @ts-ignore - Custom CSS variable for editor background
              '--bn-colors-editor-background': data.backgroundColor,
            }}
          />
        </BaseNodeContent>

        {canEdit && (
          <BaseNodeControl
            layoutType={layoutType}
            selected={isSelected}
            dragging={dragging}
            className="hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLayoutClick}
              className="h-6 w-6 p-1"
              title="Update Subtree Layout"
            >
              <Network className="h-3 w-3" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-1" title="Change Edge Path Type">
                  <Workflow className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-48 p-2">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs"
                    onClick={() => handlePathTypeChange(PATH_TYPES.SMOOTHSTEP)}
                  >
                    <SmoothStepIcon />
                    Smooth Step
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs"
                    onClick={() => handlePathTypeChange(PATH_TYPES.BEZIER)}
                  >
                    <BezierIcon />
                    Bezier
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs"
                    onClick={() => handlePathTypeChange(PATH_TYPES.STRAIGHT)}
                  >
                    <StraightIcon />
                    Straight
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <ColorPickerControl
              hex={hex}
              setHex={(color: string) => {
                handleEdgeColorChange(color);
                setHex(color);
              }}
              hasPicker={false}
            />
          </BaseNodeControl>
        )}
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.data === nextProps.data &&
      prevProps.selected === nextProps.selected &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

export default RootNodeBlock;
