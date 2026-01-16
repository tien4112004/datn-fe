import type { RecentProject } from '../types';

export const MOCK_RECENT_PROJECTS: RecentProject[] = [
  {
    id: '1',
    title: 'Solar System Presentation',
    type: 'presentation',
    timestamp: '2 hours ago',
    route: '/presentation/1',
    thumbnail: null,
  },
  {
    id: '2',
    title: 'Mountain Landscape',
    type: 'image',
    timestamp: '5 hours ago',
    route: '/image/2',
    thumbnail: null,
  },
  {
    id: '3',
    title: 'Product Launch Strategy',
    type: 'mindmap',
    timestamp: 'Yesterday',
    route: '/mindmap/3',
    thumbnail: null,
  },
  {
    id: '4',
    title: 'Marketing Campaign Ideas',
    type: 'presentation',
    timestamp: '2 days ago',
    route: '/presentation/4',
    thumbnail: null,
  },
  {
    id: '5',
    title: 'Abstract Art Composition',
    type: 'image',
    timestamp: '3 days ago',
    route: '/image/5',
    thumbnail: null,
  },
  {
    id: '6',
    title: 'Project Planning Overview',
    type: 'mindmap',
    timestamp: '1 week ago',
    route: '/mindmap/6',
    thumbnail: null,
  },
];

export const MOCK_AI_RESPONSES = {
  greeting: "Hi! I'm your AI assistant. How can I help you create something amazing today?",
  image:
    "I can help you generate stunning AI images! Just head to the 'Generate Image' section and describe what you'd like to create. You can specify art styles, dimensions, and more.",
  presentation:
    "Creating presentations is easy! Click on 'Create Presentation' to get started. I can help you generate slide content, layouts, and even suggest visuals for your topic.",
  mindmap:
    "Mindmaps are great for organizing ideas! Use the 'Create Mindmap' feature to visualize complex topics. I can generate hierarchical structures based on any subject you provide.",
  help: 'I can assist you with:\n• Generating AI images from text descriptions\n• Creating presentation outlines and slides\n• Building mindmaps for any topic\n• Answering questions about the platform\n\nWhat would you like to explore?',
  default:
    "That's interesting! I'm here to help you create images, presentations, and mindmaps. You can also ask me about specific features. What would you like to work on?",
} as const;
