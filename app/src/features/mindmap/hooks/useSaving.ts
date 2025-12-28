import { useState } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useUpdateMindmapWithMetadata } from './useApi';
import { useCoreStore } from '../stores/core';
import { useMetadataStore } from '../stores/metadata';
import { useDirtyStore } from '../stores/dirty';
import { usePresenterModeStore, useViewModeStore } from '../stores';
import { useSavingStore } from '../stores/saving';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

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
    // Set saving state immediately
    useSavingStore.getState().setIsSaving(true);

    // Yield to the event loop to allow React to render the spinner before CPU-intensive work
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Prevent save in presenter mode or view mode
    const isPresenterMode = usePresenterModeStore.getState().isPresenterMode;
    const isViewMode = useViewModeStore.getState().isViewMode;

    if (isPresenterMode || isViewMode) {
      console.log('saveWithThumbnail: Skipping save in presenter/view mode');
      toast.info(isViewMode ? 'Cannot save in view mode' : 'Cannot save while in presenter mode');
      useSavingStore.getState().setIsSaving(false);
      return;
    }

    try {
      setIsGeneratingThumbnail(true);
      // Generate thumbnail first
      await generateThumbnail();

      // Get current viewport
      const viewport = getViewport();

      // Then save mindmap with metadata (including thumbnail and viewport)
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
      useSavingStore.getState().setIsSaving(false);
    }
  };

  return {
    saveWithThumbnail,
    isLoading: updateMindmap.isPending || isGeneratingThumbnail,
  };
};
