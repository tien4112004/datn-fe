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
    name: 'Improve Writing',
    description: 'Enhance writing quality and clarity',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: FileEdit,
    parameters: [
      {
        id: 'tone',
        name: 'Tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'Professional', value: 'professional' },
          { label: 'Casual', value: 'casual' },
          { label: 'Academic', value: 'academic' },
        ],
        required: true,
      },
      {
        id: 'style',
        name: 'Style',
        type: 'radio',
        defaultValue: 'balanced',
        options: [
          { label: 'Concise', value: 'concise' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'translate-content',
    name: 'Translate Content',
    description: 'Translate text to another language',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: Languages,
    parameters: [
      {
        id: 'targetLanguage',
        name: 'Target Language',
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
    name: 'Summarize Slide',
    description: 'Create a concise summary of slide content',
    category: 'text',
    contexts: [{ type: 'slide' }],
    icon: FileText,
    parameters: [
      {
        id: 'length',
        name: 'Length',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'Brief', value: 'brief' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'expand-content',
    name: 'Expand Content',
    description: 'Add more detail to existing content',
    category: 'text',
    contexts: [{ type: 'slide' }, { type: 'element', elementTypes: ['text'] }],
    icon: FilePlus2,
    parameters: [
      {
        id: 'depth',
        name: 'Depth',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Comprehensive', value: 'comprehensive' },
        ],
      },
    ],
  },
  {
    id: 'rewrite-text',
    name: 'Rewrite Text',
    description: 'Rewrite text with a different tone or length',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: Type,
    parameters: [
      {
        id: 'tone',
        name: 'Tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'Professional', value: 'professional' },
          { label: 'Casual', value: 'casual' },
          { label: 'Friendly', value: 'friendly' },
          { label: 'Academic', value: 'academic' },
        ],
        required: true,
      },
      {
        id: 'length',
        name: 'Length',
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
    name: 'Fix Grammar',
    description: 'Correct grammar and spelling errors',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: Check,
    parameters: [
      {
        id: 'formality',
        name: 'Formality',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'Casual', value: 'casual' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Professional', value: 'professional' },
        ],
      },
    ],
  },
  {
    id: 'change-tone',
    name: 'Change Tone',
    description: 'Adjust the tone of the text',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: MessageSquare,
    parameters: [
      {
        id: 'tone',
        name: 'Tone',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'Professional', value: 'professional' },
          { label: 'Friendly', value: 'friendly' },
          { label: 'Persuasive', value: 'persuasive' },
          { label: 'Informative', value: 'informative' },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'bullet-conversion',
    name: 'Bullet Conversion',
    description: 'Convert between bullet points, numbered lists, and paragraphs',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['text'] }],
    icon: List,
    parameters: [
      {
        id: 'format',
        name: 'Format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'Bullets', value: 'bullets' },
          { label: 'Numbered', value: 'numbered' },
          { label: 'Paragraph', value: 'paragraph' },
        ],
        required: true,
      },
    ],
  },

  // ============ DESIGN ACTIONS ============
  {
    id: 'redesign-layout',
    name: 'Redesign Layout',
    description: 'Suggest a new layout for the slide',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: LayoutGrid,
    parameters: [
      {
        id: 'stylePreference',
        name: 'Style Preference',
        type: 'radio',
        defaultValue: 'modern',
        options: [
          { label: 'Modern', value: 'modern' },
          { label: 'Classic', value: 'classic' },
          { label: 'Minimal', value: 'minimal' },
        ],
      },
    ],
  },
  {
    id: 'enhance-hierarchy',
    name: 'Enhance Hierarchy',
    description: 'Improve visual hierarchy of elements',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: Layers,
    parameters: [
      {
        id: 'emphasisLevel',
        name: 'Emphasis Level',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'Subtle', value: 'subtle' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Strong', value: 'strong' },
        ],
      },
    ],
  },
  {
    id: 'suggest-color-scheme',
    name: 'Suggest Color Scheme',
    description: 'Generate a color scheme for the slide',
    category: 'design',
    contexts: [{ type: 'slide' }],
    icon: Palette,
    parameters: [
      {
        id: 'mood',
        name: 'Mood',
        type: 'select',
        defaultValue: 'professional',
        options: [
          { label: 'Professional', value: 'professional' },
          { label: 'Creative', value: 'creative' },
          { label: 'Energetic', value: 'energetic' },
        ],
      },
    ],
  },

  // ============ IMAGE ACTIONS ============
  {
    id: 'generate-alt-text',
    name: 'Generate Alt Text',
    description: 'Generate accessible alt text for image',
    category: 'text',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: ImageIcon,
    parameters: [
      {
        id: 'detailLevel',
        name: 'Detail Level',
        type: 'radio',
        defaultValue: 'moderate',
        options: [
          { label: 'Brief', value: 'brief' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
    ],
  },
  {
    id: 'suggest-similar',
    name: 'Suggest Similar',
    description: 'Find similar images from library',
    category: 'design',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: Copy,
    parameters: [
      {
        id: 'source',
        name: 'Source',
        type: 'radio',
        defaultValue: 'pexels',
        options: [
          { label: 'Pexels', value: 'pexels' },
          { label: 'Library', value: 'library' },
        ],
      },
    ],
  },
  {
    id: 'enhance-image',
    name: 'Enhance Image',
    description: 'Apply automatic enhancements to image',
    category: 'design',
    contexts: [{ type: 'element', elementTypes: ['image'] }],
    icon: Sparkles,
    parameters: [
      {
        id: 'enhancementType',
        name: 'Enhancement Type',
        type: 'select',
        defaultValue: 'brightness',
        options: [
          { label: 'Brightness', value: 'brightness' },
          { label: 'Contrast', value: 'contrast' },
          { label: 'Sharpen', value: 'sharpen' },
        ],
      },
    ],
  },

  // ============ MULTI-ELEMENT ACTIONS ============
  {
    id: 'align-balance',
    name: 'Align & Balance',
    description: 'Balance and align multiple elements',
    category: 'design',
    contexts: [{ type: 'elements' }],
    icon: AlignHorizontalJustifyCenter,
    parameters: [
      {
        id: 'layoutPreference',
        name: 'Layout Preference',
        type: 'radio',
        defaultValue: 'grid',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Freeform', value: 'freeform' },
          { label: 'Centered', value: 'centered' },
        ],
      },
    ],
  },
  {
    id: 'create-grouping',
    name: 'Create Grouping',
    description: 'Group elements intelligently',
    category: 'design',
    contexts: [{ type: 'elements' }],
    icon: Group,
    parameters: [
      {
        id: 'groupBy',
        name: 'Group By',
        type: 'select',
        defaultValue: 'proximity',
        options: [
          { label: 'Proximity', value: 'proximity' },
          { label: 'Type', value: 'type' },
          { label: 'Color', value: 'color' },
        ],
      },
    ],
  },

  // ============ GENERATION ACTIONS ============
  {
    id: 'generate-from-topic',
    name: 'Generate from Topic',
    description: 'Generate new slides from a topic',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: PlusSquare,
    parameters: [
      {
        id: 'topic',
        name: 'Topic',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Enter the topic for your slides...',
        required: true,
      },
      {
        id: 'slideCount',
        name: 'Slide Count',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        required: true,
      },
      {
        id: 'stylePreference',
        name: 'Style Preference',
        type: 'select',
        defaultValue: 'modern',
        options: [
          { label: 'Modern', value: 'modern' },
          { label: 'Classic', value: 'classic' },
          { label: 'Minimal', value: 'minimal' },
        ],
      },
    ],
  },
  {
    id: 'expand-slide',
    name: 'Expand Slide',
    description: 'Expand current slide into multiple slides',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: Copy,
    parameters: [
      {
        id: 'slideCount',
        name: 'Slide Count',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5,
        required: true,
      },
      {
        id: 'focusArea',
        name: 'Focus Area',
        type: 'text',
        defaultValue: '',
        placeholder: 'Specific area to focus on (optional)...',
      },
    ],
  },
  {
    id: 'create-conclusion',
    name: 'Create Conclusion',
    description: 'Generate a conclusion slide',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: ListChecks,
    parameters: [
      {
        id: 'format',
        name: 'Format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'Bullets', value: 'bullets' },
          { label: 'Visual', value: 'visual' },
          { label: 'Text-heavy', value: 'text-heavy' },
        ],
      },
    ],
  },
  {
    id: 'create-agenda',
    name: 'Create Agenda',
    description: 'Generate an agenda slide',
    category: 'generate',
    contexts: [{ type: 'slide' }],
    icon: ListOrdered,
    parameters: [
      {
        id: 'format',
        name: 'Format',
        type: 'radio',
        defaultValue: 'bullets',
        options: [
          { label: 'Bullets', value: 'bullets' },
          { label: 'Numbered', value: 'numbered' },
        ],
      },
      {
        id: 'includeSlideNumbers',
        name: 'Include Slide Numbers',
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
