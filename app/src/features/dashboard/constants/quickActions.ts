import { Image, Presentation, Brain, Sparkles } from 'lucide-react';
import type { QuickAction } from '../types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'generate-image',
    title: 'Generate Image',
    description: 'Create AI-generated images',
    icon: Image,
    route: '/image/generate',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'create-presentation',
    title: 'Create Presentation',
    description: 'Build stunning slide decks',
    icon: Presentation,
    route: '/presentation/generate',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'create-mindmap',
    title: 'Create Mindmap',
    description: 'Visualize your ideas',
    icon: Brain,
    route: '/mindmap/generate',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get help with anything',
    icon: Sparkles,
    route: '#chat',
    gradient: 'from-orange-500 to-red-500',
  },
];
