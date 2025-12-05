export const moduleMap: Record<string, () => Promise<any>> = {
  // This key mirrors the remote name used by the presentation container app
  thumbnail: () => import('vueRemote/ThumbnailSlide'),
  editor: () => import('vueRemote/Editor'),
};

export const moduleMethodMap: Record<string, () => Promise<any>> = {
  method: () => import('vueRemote/method'),
};
