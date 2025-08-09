import { useEffect } from 'react';

type Modifier = 'Ctrl' | 'Shift' | 'Alt';

export type ShortcutKey =
  | string
  | string
  | `${Modifier}+${string}`
  | `${Modifier}+${Modifier}+${string}`
  | `${Modifier}+${Modifier}+${Modifier}+${string}`;

export interface ShortcutConfig {
  key: ShortcutKey;
  callback: (event: KeyboardEvent) => void;
}

interface ParsedShortcut {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export const useShortcuts = (shortcuts: ShortcutConfig[], preventDefault = true) => {
  useEffect(() => {
    const handlers = shortcuts.map((shortcut) => {
      const parsed = parseShortcut(shortcut.key);

      return (event: KeyboardEvent) => {
        if (
          event.key.toLowerCase() === parsed.key &&
          !!event.ctrlKey === parsed.ctrlKey &&
          !!event.shiftKey === parsed.shiftKey &&
          !!event.altKey === parsed.altKey
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.callback(event);
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
  }, [shortcuts, preventDefault]);
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
