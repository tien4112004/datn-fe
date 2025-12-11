import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Metadata store for universal (non-tree-specific) mindmap state.
 *
 * Note: Layout-related metadata (layoutType, forceLayout) are now stored
 * in the root node's data for per-tree support. This store only contains
 * truly universal state like thumbnail.
 */
interface MetadataState {
  thumbnail?: string;
  setThumbnail: (thumbnail: string) => void;
  getThumbnail: () => string | undefined;
  reset: () => void;
}

export const useMetadataStore = create<MetadataState>()(
  devtools(
    persist(
      (set, get) => ({
        thumbnail: undefined,

        setThumbnail: (thumbnail) => {
          set({ thumbnail }, false, 'mindmap-metadata/setThumbnail');
        },

        getThumbnail: () => {
          const state = get();
          return state.thumbnail;
        },

        reset: () => {
          set(
            {
              thumbnail: undefined,
            },
            false,
            'mindmap-metadata/reset'
          );
        },
      }),
      {
        name: 'mindmap-metadata-store',
      }
    )
  )
);
