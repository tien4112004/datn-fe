export const moduleMap = {
  editor: () => import('vueRemote/Editor'),
  thumbnail: () => import('vueRemote/ThumbnailSlide'),
} as Record<string, () => Promise<{ mount: (el: HTMLElement | null, props: any) => void }>>;
