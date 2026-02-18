import { Button } from '@ui/button';
import { cn } from '@/shared/lib/utils';
import type { NodeProps } from '@xyflow/react';
import { Loader2, Network, Upload, X } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { useCoreStore, useLayoutStore, useNodeOperationsStore } from '../../stores';
import type { ImageNode } from '../../types';
import { DRAGHANDLE } from '../../types/constants';
import { DEFAULT_LAYOUT_TYPE } from '../../services/utils';
import { BaseNodeControl } from '../controls/BaseNodeControl';
import { BaseNodeContent } from '../ui/base-node';
import { BaseNodeBlock } from './BaseNode';

/**
 * @deprecated ImageNode is deprecated and will be removed in a future version.
 * Please use TextNode or other alternative node types instead.
 */
const ImageNodeBlock = memo(
  ({ ...node }: NodeProps<ImageNode>) => {
    const { id, data, selected, width, height } = node;

    // Deprecation warning
    console.warn(
      '[Mindmap] ImageNode is deprecated and will be removed in a future version. ' +
        'Please use TextNode or other alternative node types instead.'
    );

    // Get layoutType using cached maps - O(1) lookup
    const layoutType = useCoreStore((state) => {
      const rootId = state.nodeToRootMap.get(id);
      return (rootId && state.rootLayoutTypeMap.get(rootId)) || DEFAULT_LAYOUT_TYPE;
    });
    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeData);
    const updateNodeDataWithUndo = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);

    const [isEditing, setIsEditing] = useState(!data.imageUrl);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageLoad = useCallback(
      async (imageUrl: string) => {
        setIsLoadingImage(true);
        console.log('Loading image:', imageUrl);
        try {
          // Create a temporary image to get dimensions
          const img = new Image();
          img.onload = () => {
            updateNodeDataWithUndo(id, {
              imageUrl,
              width: img.naturalWidth,
              height: img.naturalHeight,
              isLoading: false,
            });
            setIsEditing(false);
            setIsLoadingImage(false);
          };
          img.onerror = () => {
            console.error('Failed to load image');
            setIsLoadingImage(false);
            updateNodeData(id, { isLoading: false });
          };
          img.src = imageUrl;
        } catch (error) {
          console.error('Error loading image:', error);
          setIsLoadingImage(false);
          updateNodeData(id, { isLoading: false });
        }
      },
      [id, updateNodeData]
    );

    const handleFileUpload = useCallback(
      (file: File) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              handleImageLoad(result);
            }
          };
          reader.readAsDataURL(file);
        }
      },
      [handleImageLoad]
    );

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      },
      [handleFileUpload]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileUpload(file);
        }
      },
      [handleFileUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);

    const handleRemoveImage = useCallback(() => {
      updateNodeDataWithUndo(id, {
        imageUrl: undefined,
        width: 250,
        height: 180,
      });
      setIsEditing(true);
    }, [id, updateNodeData]);

    const handleLayoutClick = () => {
      updateSubtreeLayout(id, layoutType);
    };

    return (
      <BaseNodeBlock node={node} variant={data.imageUrl && !isEditing ? 'replacing' : 'card'}>
        {data.imageUrl && !isEditing ? (
          <div
            className={cn('relative h-full w-full', DRAGHANDLE.CLASS)}
            style={{
              width: width ? `${width}px` : '200px',
              height: height ? `${height}px` : '150px',
            }}
          >
            {/* Disable image dragging */}
            <img
              src={data.imageUrl}
              alt={data.alt || 'Image'}
              className="h-full w-full object-cover"
              onDoubleClick={() => setIsEditing(true)}
              draggable={false}
            />

            <BaseNodeControl
              layoutType={layoutType}
              selected={selected}
              spacing="lg"
              dragging={node.dragging}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="h-6 w-6 p-1"
                title="Remove Image"
              >
                <X className="h-3 w-3" />
              </Button>
            </BaseNodeControl>
          </div>
        ) : (
          // Upload mode - using "card" variant
          <BaseNodeContent className="flex items-center justify-center p-4">
            {isLoadingImage ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                <span className="text-muted-foreground text-sm">Loading image...</span>
              </div>
            ) : (
              <div
                className="border-muted-foreground/25 hover:border-muted-foreground/50 flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                <span className="text-muted-foreground text-sm font-medium">
                  Drop image or click to upload
                </span>
                <span className="text-muted-foreground mt-1 text-xs">PNG, JPG, GIF up to 10MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </BaseNodeContent>
        )}
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.id === nextProps.id &&
      prevProps.data === nextProps.data &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

export default ImageNodeBlock;
