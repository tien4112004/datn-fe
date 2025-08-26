import { useEffect } from 'react';

type Modifier = 'Ctrl' | 'Shift' | 'Alt';

export type ShortcutKey =
  | string
  | string
  | `${Modifier}+${string}`
  | `${Modifier}+${Modifier}+${string}`
  | `${Modifier}+${Modifier}+${Modifier}+${string}`;

export interface ShortcutConfig {
  shortcutKey: ShortcutKey;
  onKeyPressed: (event: KeyboardEvent) => void;
  shouldExecute?: (event: KeyboardEvent) => boolean;
}

interface ParsedShortcut {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export const useShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handlers = shortcuts.map((shortcut) => {
      const parsed = parseShortcut(shortcut.shortcutKey);

      return (event: KeyboardEvent) => {
        if (
          event.key.toLowerCase() === parsed.key &&
          !!event.ctrlKey === parsed.ctrlKey &&
          !!event.shiftKey === parsed.shiftKey &&
          !!event.altKey === parsed.altKey
        ) {
          if (!shortcut.shouldExecute || shortcut.shouldExecute(event)) {
            event.preventDefault();
            shortcut.onKeyPressed(event);
            return;
          }
        }
      };
    });

    // Add all handlers
    handlers.forEach((handler) => {
      window.addEventListener('keydown', handler);
    });

    // Cleanup all handlers
    return () => {
      handlers.forEach((handler) => {
        window.removeEventListener('keydown', handler);
      });
    };
  }, [shortcuts]);
};

const parseShortcut = (shortcutString: string): ParsedShortcut => {
  const parts = shortcutString
    .toLowerCase()
    .split('+')
    .map((part) => part.trim());
  const key = parts[parts.length - 1];

  return {
    key,
    ctrlKey: parts.includes('ctrl'),
    shiftKey: parts.includes('shift'),
    altKey: parts.includes('alt'),
  };
};
