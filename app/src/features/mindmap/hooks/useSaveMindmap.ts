// Re-export from the canonical implementation.
// Do not add logic here — edit useSaving.ts instead.
export { useSaveMindmap } from './useSaving';

const THUMBNAIL_SIZE = 2048;
const THUMBNAIL_PADDING = 0;

export const useSaveMindmap = () => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const { getNodes, getNodesBounds } = useReactFlow();
  const { nodes, edges } = useCoreStore();
  const setThumbnail = useMetadataStore((state) => state.setThumbnail);
  const updateMindmap = useUpdateMindmapWithMetadata();
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  const generateThumbnail = async (): Promise<string> => {
    const viewport = getMindmapViewport();
    if (!viewport) throw new Error('Mindmap viewport not found');

    const nodesBounds = getNodesBounds(getNodes());
    const viewportTransform = getViewportForBounds(
      nodesBounds,
      THUMBNAIL_SIZE,
      THUMBNAIL_SIZE,
      0.01,
      100,
      THUMBNAIL_PADDING
    );

    const dataUrl = await getImageData('png', viewport, {
      backgroundColor: 'white',
      size: THUMBNAIL_SIZE,
      viewportTransform,
    });

    setThumbnail(dataUrl);
    return dataUrl;
  };

  const saveWithThumbnail = async (mindmapId: string) => {
    try {
      setIsGeneratingThumbnail(true);
      // Generate thumbnail first
      await generateThumbnail();

      // Then save mindmap with metadata (including thumbnail)
      await updateMindmap.mutateAsync({
        id: mindmapId,
        data: {
          nodes,
          edges,
        },
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
