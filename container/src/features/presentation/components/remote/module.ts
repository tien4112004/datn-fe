export const moduleMap = {
  editor: () => import('vueRemote/Editor'),
  thumbnail: () => import('vueRemote/ThumbnailSlide'),
} as Record<string, () => Promise<{ mount: (el: HTMLElement | null, props: any) => void }>>;

export const moduleMethodMap = {
  method: () => import('vueRemote/method'),
} as Record<string, () => Promise<{ default: (...args: any[]) => Promise<any> }>>;
