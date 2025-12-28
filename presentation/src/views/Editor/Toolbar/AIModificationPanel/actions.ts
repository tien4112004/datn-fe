import {
  FileEdit,
  Languages,
  FileText,
  FilePlus2,
  Type,
  Check,
  MessageSquare,
  List,
  Palette,
  LayoutGrid,
  Layers,
  Image as ImageIcon,
  Sparkles,
  AlignHorizontalJustifyCenter,
  Group,
  PlusSquare,
  Copy,
  ListChecks,
  ListOrdered,
} from 'lucide-vue-next';
import type { AIAction } from '@/types/aiModification';

export const AI_ACTIONS: AIAction[] = [
  // ============ SLIDE & ELEMENT TEXT ACTIONS ============
  {
    id: 'improve-writing',
    name: 'panels.aiModification.actions.improveWriting',
    description: 'panels.aiModification.actions.improveWritingDesc',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: FileEdit,
    parameters: [
      {
        id: 'tone',
        name: 'panels.aiModification.parameters.tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'panels.aiModification.options.professional', value: 'professional' },
          { label: 'panels.aiModification.options.casual', value: 'casual' },
          { label: 'panels.aiModification.options.academic', value: 'academic' },
        ],
        required: true,
      },
      {
        id: 'style',
        name: 'panels.aiModification.parameters.style',
        type: 'radio',
        defaultValue: 'balanced',
        options: [
          { label: 'panels.aiModification.options.concise', value: 'concise' },
          { label: 'panels.aiModification.options.balanced', value: 'balanced' },
          { label: 'panels.aiModification.options.detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'translate-content',
    name: 'panels.aiModification.actions.translateContent',
    description: 'panels.aiModification.actions.translateContentDesc',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: Languages,
    parameters: [
      {
        id: 'targetLanguage',
        name: 'panels.aiModification.parameters.targetLanguage',
        type: 'select',
        defaultValue: 'vi',
        options: [
          { label: 'Vietnamese', value: 'vi' },
          { label: 'English', value: 'en' },
          { label: 'French', value: 'fr' },
          { label: 'Spanish', value: 'es' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Chinese', value: 'zh' },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'summarize-slide',
    name: 'panels.aiModification.actions.summarizeSlide',
    description: 'panels.aiModification.actions.summarizeSlideDesc',
    category: 'text',
    contexts: [{ type: 'slide' }],
    icon: FileText,
    parameters: [
      {
        id: 'length',
        name: 'panels.aiModification.parameters.length',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'panels.aiModification.options.brief', value: 'brief' },
          { label: 'panels.aiModification.options.moderate', value: 'moderate' },
          { label: 'panels.aiModification.options.detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'expand-content',
    name: 'panels.aiModification.actions.expandContent',
    description: 'panels.aiModification.actions.expandContentDesc',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: FilePlus2,
    parameters: [
      {
        id: 'depth',
        name: 'panels.aiModification.parameters.depth',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'panels.aiModification.options.light', value: 'light' },
          { label: 'panels.aiModification.options.moderate', value: 'moderate' },
          { label: 'panels.aiModification.options.comprehensive', value: 'comprehensive' },
        ],
      },
    ],
  },
  {
    id: 'rewrite-text',
    name: 'panels.aiModification.actions.rewriteText',
    description: 'panels.aiModification.actions.rewriteTextDesc',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: Type,
    parameters: [
      {
        id: 'tone',
        name: 'panels.aiModification.parameters.tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'panels.aiModification.options.professional', value: 'professional' },
          { label: 'panels.aiModification.options.casual', value: 'casual' },
          { label: 'panels.aiModification.options.friendly', value: 'friendly' },
          { label: 'panels.aiModification.options.academic', value: 'academic' },
        ],
        required: true,
      },
      {
        id: 'length',
        name: 'panels.aiModification.parameters.length',
        type: 'radio',
        defaultValue: 'same',
        options: [
          { label: 'Shorter', value: 'shorter' },
          { label: 'Same', value: 'same' },
          { label: 'Longer', value: 'longer' },
        ],
      },
    ],
  },
  {
    id: 'fix-grammar',
    name: 'panels.aiModification.actions.fixGrammar',
    description: 'panels.aiModification.actions.fixGrammarDesc',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: Check,
    parameters: [
      {
        id: 'formality',
        name: 'panels.aiModification.parameters.formality',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'panels.aiModification.options.casual', value: 'casual' },
          { label: 'panels.aiModification.options.moderate', value: 'moderate' },
          { label: 'panels.aiModification.options.professional', value: 'professional' },
        ],
      },
    ],
  },
  {
    id: 'change-tone',
    name: 'panels.aiModification.actions.changeTone',
    description: 'panels.aiModification.actions.changeToneDesc',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: MessageSquare,
    parameters: [
      {
        id: 'tone',
        name: 'panels.aiModification.parameters.tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'panels.aiModification.options.professional', value: 'professional' },
          { label: 'panels.aiModification.options.friendly', value: 'friendly' },
          { label: 'panels.aiModification.options.persuasive', value: 'persuasive' },
          { label: 'panels.aiModification.options.informative', value: 'informative' },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'bullet-conversion',
    name: 'panels.aiModification.actions.bulletConversion',
    description: 'panels.aiModification.actions.bulletConversionDesc',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: List,
    parameters: [
      {
        id: 'format',
        name: 'panels.aiModification.parameters.format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'panels.aiModification.options.bullets', value: 'bullets' },
          { label: 'panels.aiModification.options.numbered', value: 'numbered' },
          { label: 'panels.aiModification.options.paragraph', value: 'paragraph' },
        ],
        required: true,
      },
    ],
  },

  // ============ DESIGN ACTIONS ============
  {
    id: 'redesign-layout',
    name: 'panels.aiModification.actions.redesignLayout',
    description: 'panels.aiModification.actions.redesignLayoutDesc',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: LayoutGrid,
    parameters: [
      {
        id: 'stylePreference',
        name: 'panels.aiModification.parameters.stylePreference',
        type: 'radio',
        defaultValue: 'modern',
        options: [
          { label: 'panels.aiModification.options.modern', value: 'modern' },
          { label: 'panels.aiModification.options.classic', value: 'classic' },
          { label: 'panels.aiModification.options.minimal', value: 'minimal' },
        ],
      },
    ],
  },
  {
    id: 'enhance-hierarchy',
    name: 'panels.aiModification.actions.enhanceHierarchy',
    description: 'panels.aiModification.actions.enhanceHierarchyDesc',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: Layers,
    parameters: [
      {
        id: 'emphasisLevel',
        name: 'panels.aiModification.parameters.emphasisLevel',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'panels.aiModification.options.subtle', value: 'subtle' },
          { label: 'panels.aiModification.options.moderate', value: 'moderate' },
          { label: 'panels.aiModification.options.strong', value: 'strong' },
        ],
      },
    ],
  },
  {
    id: 'suggest-color-scheme',
    name: 'panels.aiModification.actions.suggestColorScheme',
    description: 'panels.aiModification.actions.suggestColorSchemeDesc',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: Palette,
    parameters: [
      {
        id: 'mood',
        name: 'panels.aiModification.parameters.mood',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'panels.aiModification.options.professional', value: 'professional' },
          { label: 'panels.aiModification.options.creative', value: 'creative' },
          { label: 'panels.aiModification.options.energetic', value: 'energetic' },
        ],
      },
    ],
  },

  // ============ IMAGE ACTIONS ============
  {
    id: 'generate-alt-text',
    name: 'panels.aiModification.actions.generateAltText',
    description: 'panels.aiModification.actions.generateAltTextDesc',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: ImageIcon,
    parameters: [
      {
        id: 'detailLevel',
        name: 'panels.aiModification.parameters.detailLevel',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'panels.aiModification.options.brief', value: 'brief' },
          { label: 'panels.aiModification.options.moderate', value: 'moderate' },
          { label: 'panels.aiModification.options.detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'suggest-similar',
    name: 'panels.aiModification.actions.suggestSimilar',
    description: 'panels.aiModification.actions.suggestSimilarDesc',
    category: 'design',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: Copy,
    parameters: [
      {
        id: 'source',
        name: 'panels.aiModification.parameters.source',
        type: 'radio',
        defaultValue: 'pexels',
        options: [
          { label: 'panels.aiModification.options.pexels', value: 'pexels' },
          { label: 'panels.aiModification.options.library', value: 'library' },
        ],
      },
    ],
  },
  {
    id: 'enhance-image',
    name: 'panels.aiModification.actions.enhanceImage',
    description: 'panels.aiModification.actions.enhanceImageDesc',
    category: 'design',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: Sparkles,
    parameters: [
      {
        id: 'enhancementType',
        name: 'panels.aiModification.parameters.enhancementType',
        type: 'select',
        defaultValue: 'brightness',
        options: [
          { label: 'panels.aiModification.options.brightness', value: 'brightness' },
          { label: 'panels.aiModification.options.contrast', value: 'contrast' },
          { label: 'panels.aiModification.options.sharpen', value: 'sharpen' },
        ],
      },
    ],
  },

  // ============ MULTI-ELEMENT ACTIONS ============
  {
    id: 'align-balance',
    name: 'panels.aiModification.actions.alignBalance',
    description: 'panels.aiModification.actions.alignBalanceDesc',
    category: 'design',
    contexts: [{ type: 'elements' }],
    icon: AlignHorizontalJustifyCenter,
    parameters: [
      {
        id: 'layoutPreference',
        name: 'panels.aiModification.parameters.layoutPreference',
        type: 'radio',
        defaultValue: 'grid',
        options: [
          { label: 'panels.aiModification.options.grid', value: 'grid' },
          { label: 'panels.aiModification.options.freeform', value: 'freeform' },
          { label: 'panels.aiModification.options.centered', value: 'centered' },
        ],
      },
    ],
  },
  {
    id: 'create-grouping',
    name: 'panels.aiModification.actions.createGrouping',
    description: 'panels.aiModification.actions.createGroupingDesc',
    category: 'design',
    contexts: [{ type: 'elements' }],
    icon: Group,
    parameters: [
      {
        id: 'groupBy',
        name: 'panels.aiModification.parameters.groupBy',
        type: 'select',
        defaultValue: 'proximity',
        options: [
          { label: 'panels.aiModification.options.proximity', value: 'proximity' },
          { label: 'panels.aiModification.options.type', value: 'type' },
          { label: 'panels.aiModification.options.color', value: 'color' },
        ],
      },
    ],
  },

  // ============ GENERATION ACTIONS ============
  {
    id: 'generate-from-topic',
    name: 'panels.aiModification.actions.generateFromTopic',
    description: 'panels.aiModification.actions.generateFromTopicDesc',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: PlusSquare,
    parameters: [
      {
        id: 'topic',
        name: 'panels.aiModification.parameters.topic',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Enter the topic for your slides...',
        required: true,
      },
      {
        id: 'slideCount',
        name: 'panels.aiModification.parameters.slideCount',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        required: true,
      },
      {
        id: 'stylePreference',
        name: 'panels.aiModification.parameters.stylePreference',
        type: 'select',
        defaultValue: 'modern',
        options: [
          { label: 'panels.aiModification.options.modern', value: 'modern' },
          { label: 'panels.aiModification.options.classic', value: 'classic' },
          { label: 'panels.aiModification.options.minimal', value: 'minimal' },
        ],
      },
    ],
  },
  {
    id: 'expand-slide',
    name: 'panels.aiModification.actions.expandSlide',
    description: 'panels.aiModification.actions.expandSlideDesc',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: Copy,
    parameters: [
      {
        id: 'slideCount',
        name: 'panels.aiModification.parameters.slideCount',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5,
        required: true,
      },
      {
        id: 'focusArea',
        name: 'panels.aiModification.parameters.focusArea',
        type: 'text',
        defaultValue: '',
        placeholder: 'Specific area to focus on (optional)...',
      },
    ],
  },
  {
    id: 'create-conclusion',
    name: 'panels.aiModification.actions.createConclusion',
    description: 'panels.aiModification.actions.createConclusionDesc',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: ListChecks,
    parameters: [
      {
        id: 'format',
        name: 'panels.aiModification.parameters.format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'panels.aiModification.options.bullets', value: 'bullets' },
          { label: 'Visual', value: 'visual' },
          { label: 'Text-heavy', value: 'text-heavy' },
        ],
      },
    ],
  },
  {
    id: 'create-agenda',
    name: 'panels.aiModification.actions.createAgenda',
    description: 'panels.aiModification.actions.createAgendaDesc',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: ListOrdered,
    parameters: [
      {
        id: 'format',
        name: 'panels.aiModification.parameters.format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'panels.aiModification.options.bullets', value: 'bullets' },
          { label: 'panels.aiModification.options.numbered', value: 'numbered' },
        ],
      },
      {
        id: 'includeSlideNumbers',
        name: 'panels.aiModification.parameters.includeSlideNumbers',
        type: 'radio',
        defaultValue: 'yes',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
    ],
  },
];

// Helper function to filter actions by context
export function getActionsForContext(contextType: string, elementType?: string): AIAction[] {
  return AI_ACTIONS.filter((action) => {
    return action.contexts.some((ctx) => {
      if (ctx.type !== contextType) return false;
      if (elementType && ctx.elementTypes && !ctx.elementTypes.includes(elementType as any)) {
        return false;
      }
      return true;
    });
  });
}

// Helper function to get actions by category
export function getActionsByCategory(category: string, actions: AIAction[]): AIAction[] {
  return actions.filter((action) => action.category === category);
}
