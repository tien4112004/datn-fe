import { useState } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useUpdateMindmapWithMetadata } from './useApi';
import { useCoreStore } from '../stores/core';
import { useMetadataStore } from '../stores/metadata';
import { useDirtyStore } from '../stores/dirty';
import { usePresenterModeStore, useViewModeStore } from '../stores';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { uploadThumbnail } from '../api/thumbnail';

const imageWidth = 2048;
const imageHeight = 2048;

export const useSaveMindmap = () => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const { getNodes, getViewport } = useReactFlow();
  const { nodes, edges } = useCoreStore();
  const setThumbnail = useMetadataStore((state) => state.setThumbnail);
  const updateMindmap = useUpdateMindmapWithMetadata();
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  const generateThumbnail = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const nodesBounds = getNodesBounds(getNodes());
      const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0.5);

      toPng(document.querySelector('.react-flow__viewport' as any), {
        backgroundColor: 'white',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth.toString(),
          height: imageHeight.toString(),
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        skipFonts: true,
      })
        .then((dataUrl) => {
          setThumbnail(dataUrl);
          resolve(dataUrl);
        })
        .catch(reject);
    });
  };

  const saveWithThumbnail = async (mindmapId: string) => {
    // Prevent save in presenter mode or view mode
    const isPresenterMode = usePresenterModeStore.getState().isPresenterMode;
    const isViewMode = useViewModeStore.getState().isViewMode;

    if (isPresenterMode || isViewMode) {
      console.log('saveWithThumbnail: Skipping save in presenter/view mode');
      toast.info(isViewMode ? 'Cannot save in view mode' : 'Cannot save while in presenter mode');
      return;
    }

    try {
      setIsGeneratingThumbnail(true);

      // Generate thumbnail as base64
      const thumbnailBase64 = await generateThumbnail();

      // Upload thumbnail to R2 and get URL (with fallback to base64)
      let thumbnailUrl = thumbnailBase64; // Default fallback
      if (thumbnailBase64) {
        try {
          thumbnailUrl = await uploadThumbnail('mindmap', mindmapId, thumbnailBase64);
          console.log('Thumbnail uploaded successfully, URL:', thumbnailUrl);
          // Update metadata store with URL instead of base64
          setThumbnail(thumbnailUrl);
        } catch (error) {
          console.error('Failed to upload thumbnail, falling back to base64:', error);
          // Keep using thumbnailBase64 as fallback
        }
      }

      // Get current viewport
      const viewport = getViewport();

      // Then save mindmap with metadata (including thumbnail URL and viewport)
      await updateMindmap.mutateAsync({
        id: mindmapId,
        data: {
          nodes,
          edges,
        },
        viewport,
      });

      // Mark as saved after successful save
      const markSaved = useDirtyStore.getState().markSaved;
      markSaved();

      toast.success(t('toolbar.save.success'));
    } catch (error) {
      console.error('Failed to save mindmap with thumbnail:', error);
      toast.error(t('toolbar.save.error'));
      throw error;
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  return {
    saveWithThumbnail,
    isLoading: updateMindmap.isPending || isGeneratingThumbnail,
  };
};
