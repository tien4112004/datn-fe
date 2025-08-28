declare global {
  interface CustomEventMap {
    'app.message': CustomEvent<MessageDetail>;
  }

  interface Window {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, ev: CustomEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, ev: CustomEventMap[K]) => void
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }
}

import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    isGrow?: boolean;
    widthPercentage?: number;
    fixedWidth?: number; // 0 stands for "fit-content"
  }
}

export {};
