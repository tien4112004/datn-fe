import { FileText, Maximize2, Minimize2, CheckCircle } from 'lucide-vue-next';
import type { Component } from 'vue';

export interface QuickAction {
  label: string;
  icon: Component;
  instruction: string;
  operation: string;
}

export function useQuickActions() {
  // Slide-level quick actions
  const slideQuickActions: QuickAction[] = [
    {
      label: 'Shorten',
      icon: Minimize2,
      instruction: 'Shorten the text content, keeping key points.',
      operation: 'shorten',
    },
    {
      label: 'Expand',
      icon: Maximize2,
      instruction: 'Expand on these points with more detail.',
      operation: 'expand',
    },
    {
      label: 'Fix Grammar',
      icon: CheckCircle,
      instruction: 'Fix grammar and spelling errors.',
      operation: 'grammar',
    },
    {
      label: 'Formal',
      icon: FileText,
      instruction: 'Make the tone more professional and engaging.',
      operation: 'formal',
    },
  ];

  // Text element quick actions
  const textQuickActions: QuickAction[] = [
    {
      label: 'Fix Grammar',
      icon: CheckCircle,
      instruction: 'Fix grammar and spelling errors in this text.',
      operation: 'grammar',
    },
    {
      label: 'Shorten',
      icon: Minimize2,
      instruction: 'Make this text more concise.',
      operation: 'shorten',
    },
    {
      label: 'Expand',
      icon: Maximize2,
      instruction: 'Expand this text with more detail.',
      operation: 'expand',
    },
    {
      label: 'Formal',
      icon: FileText,
      instruction: 'Rewrite this text in a more formal tone.',
      operation: 'formal',
    },
  ];

  // Combined text quick actions
  const combinedTextQuickActions: QuickAction[] = [
    {
      label: 'Expand',
      icon: Maximize2,
      instruction: 'Expand on these points with more detail and elaboration.',
      operation: 'expand',
    },
    {
      label: 'Shorten',
      icon: Minimize2,
      instruction: 'Make these points more concise while keeping key information.',
      operation: 'shorten',
    },
    {
      label: 'Fix Grammar',
      icon: CheckCircle,
      instruction: 'Fix grammar and spelling errors in all items.',
      operation: 'grammar',
    },
    {
      label: 'Formal',
      icon: FileText,
      instruction: 'Rewrite in a more formal and professional tone.',
      operation: 'formal',
    },
  ];

  /**
   * Get quick actions based on context type
   */
  function getQuickActions(contextType: 'slide' | 'text' | 'combined-text'): QuickAction[] {
    switch (contextType) {
      case 'slide':
        return slideQuickActions;
      case 'text':
        return textQuickActions;
      case 'combined-text':
        return combinedTextQuickActions;
      default:
        return slideQuickActions;
    }
  }

  return {
    getQuickActions,
    slideQuickActions,
    textQuickActions,
    combinedTextQuickActions,
  };
}
