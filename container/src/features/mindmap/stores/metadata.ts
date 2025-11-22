import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MindmapMetadata } from '../types';

interface MetadataState {
  thumbnail?: string;
  forceLayout?: boolean;
  setThumbnail: (thumbnail: string) => void;
  setForceLayout: (forceLayout: boolean) => void;
  setMetadata: (metadata: MindmapMetadata | undefined) => void;
  getMetadata: () => MindmapMetadata | undefined;
  getThumbnail: () => string | undefined;
  reset: () => void;
}

export const useMetadataStore = create<MetadataState>()(
  devtools(
    persist(
      (set, get) => ({
        thumbnail: undefined,
        forceLayout: undefined,

        setThumbnail: (thumbnail) => {
          set({ thumbnail }, false, 'mindmap-metadata/setThumbnail');
        },

        setForceLayout: (forceLayout) => {
          set({ forceLayout }, false, 'mindmap-metadata/setForceLayout');
        },

        setMetadata: (metadata) => {
          if (!metadata) {
            set(
              {
                forceLayout: undefined,
              },
              false,
              'mindmap-metadata/reset'
            );
          } else {
            const newForceLayout = metadata.forceLayout as boolean;

            set(
              {
                forceLayout: newForceLayout,
              },
              false,
              'mindmap-metadata/setMetadata'
            );
          }
        },

        getMetadata: () => {
          const state = get();
          const metadata: MindmapMetadata = {};

          if (state.forceLayout !== undefined) {
            metadata.forceLayout = state.forceLayout;
          }

          return Object.keys(metadata).length > 0 ? metadata : undefined;
        },

        getThumbnail: () => {
          const state = get();
          return state.thumbnail;
        },

        reset: () => {
          set(
            {
              forceLayout: undefined,
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
