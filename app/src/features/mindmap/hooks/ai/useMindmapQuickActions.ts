import { useMemo } from 'react';
import type { QuickAction } from '../../types/aiModification';

export function useMindmapQuickActions(): QuickAction[] {
  return useMemo(
    () => [
      {
        icon: 'Maximize2',
        label: 'Expand',
        operation: 'expand',
        instruction: 'Add more detail to this concept',
        tooltip: 'Add 2-3 sentences of explanation',
      },
      {
        icon: 'Minimize2',
        label: 'Shorten',
        operation: 'shorten',
        instruction: 'Make this concept more concise',
        tooltip: 'Reduce to 1-2 sentences maximum',
      },
      {
        icon: 'CheckCircle',
        label: 'Fix Grammar',
        operation: 'grammar',
        instruction: 'Fix grammar and spelling',
        tooltip: 'Correct grammatical errors',
      },
      {
        icon: 'FileText',
        label: 'Formalize',
        operation: 'formal',
        instruction: 'Make this more formal and professional',
        tooltip: 'Use more academic language',
      },
    ],
    []
  );
}
