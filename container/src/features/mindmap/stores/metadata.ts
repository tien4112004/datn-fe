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
                thumbnail: undefined,
                forceLayout: undefined,
              },
              false,
              'mindmap-metadata/reset'
            );
          } else {
            const newThumbnail = metadata.thumbnail as string;
            const newForceLayout = metadata.forceLayout as boolean;

            set(
              {
                thumbnail: newThumbnail,
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

          if (state.thumbnail !== undefined) {
            metadata.thumbnail = state.thumbnail;
          }

          if (state.forceLayout !== undefined) {
            metadata.forceLayout = state.forceLayout;
          }

          return Object.keys(metadata).length > 0 ? metadata : undefined;
        },

        reset: () => {
          set(
            {
              thumbnail: undefined,
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
