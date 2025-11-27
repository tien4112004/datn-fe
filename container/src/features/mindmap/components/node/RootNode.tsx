import { GripVertical, Network, Workflow } from 'lucide-react';
import { useState, memo, useCallback, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import type { RootNode, PathType } from '../../types';
import { PATH_TYPES, DIRECTION, DRAGHANDLE } from '../../types';
import { useMindmapNodeCommon } from '../../hooks/useNodeCommon';
import { BaseNodeBlock } from './BaseNode';
import { BaseNodeContent } from '../ui/base-node';
import type { NodeProps } from '@xyflow/react';
import { useNodeManipulationStore, useNodeOperationsStore, useLayoutStore } from '../../stores';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { BezierIcon, SmoothStepIcon, StraightIcon } from '../ui/icon';

import ColorPickerControl from '../controls/ColorPickerControl';
import { useRichTextEditor } from '@/components/rte/useRichTextEditor';
import RichTextEditor from '@/components/rte/RichTextEditor';
import { BaseNodeControl } from '../controls/BaseNodeControl';

const RootNodeBlock = memo(
  ({ ...node }: NodeProps<RootNode>) => {
    const { data, selected: isSelected, width, dragging } = node;
    const { layout } = useMindmapNodeCommon<RootNode>({
      node,
    });

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
    const updateSubtreeEdgePathType = useNodeManipulationStore((state) => state.updateSubtreeEdgePathType);
    const updateSubtreeEdgeColor = useNodeManipulationStore((state) => state.updateSubtreeEdgeColor);
    const isLayouting = useLayoutStore((state) => state.isLayouting);

    const [hex, setHex] = useState<string>(data.edgeColor as string);

    const [isEditing, setIsEditing] = useState(false);

    const handleEditSubmit = useCallback(() => {
      setIsEditing(false);
      const content = data.content || '';
      updateNodeData(node.id, { content });
    }, [data.content, node.id, updateNodeData]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    }, []);

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layout);
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

    // Only create heavy rich text editor when not dragging/layouting for better performance
    const shouldUseRichEditor = !dragging && !isLayouting && isEditing;

    const editor = useRichTextEditor({
      trailingBlock: false,
      placeholders: { default: '', heading: '', emptyBlock: '' },
    });

    useEffect(() => {
      if (!shouldUseRichEditor) return;

      async function loadInitialHTML() {
        const blocks = await editor.tryParseHTMLToBlocks(data.content);
        editor.replaceBlocks(editor.document, blocks);
      }
      loadInitialHTML();
    }, [editor, data.content, shouldUseRichEditor]);

    return (
      <BaseNodeBlock node={node} className="border-primary">
        <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 p-0">
          <div className={cn('flex-shrink-0 p-2 pr-0', DRAGHANDLE.CLASS)}>
            <GripVertical
              className={cn(
                'h-6 w-5',
                isSelected ? 'opacity-100' : 'opacity-50',
                layout === DIRECTION.NONE ? 'cursor-move' : 'cursor-default'
              )}
            />
          </div>
          <div
            className="min-h-full flex-1 cursor-text p-2 pl-0"
            style={{
              width: width ? `${width - 40}px` : undefined,
              minWidth: '60px',
            }}
            onKeyDown={handleKeyPress}
          >
            {shouldUseRichEditor ? (
              <RichTextEditor
                editor={editor}
                sideMenu={false}
                slashMenu={false}
                className="m-0 min-h-[24px] w-full border-none p-0"
                onBlur={handleEditSubmit}
              />
            ) : (
              // Lightweight HTML display during drag operations
              <div
                className="m-0 min-h-[24px] w-full cursor-text p-0"
                dangerouslySetInnerHTML={{ __html: data.content }}
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        </BaseNodeContent>

        <BaseNodeControl layout={layout} selected={isSelected} dragging={dragging}>
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
