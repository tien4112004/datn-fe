import type { User } from '@/types/auth';
import type { SlideTheme, SlideTemplate, ArtStyle, Model, FAQPost, Book, Pagination } from '@/types/api';

// ============= USERS MOCK DATA =============
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-06-20T14:45:00Z',
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'USER',
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-07-10T11:20:00Z',
  },
  {
    id: 'user-3',
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'USER',
    createdAt: '2024-03-10T16:00:00Z',
    updatedAt: '2024-08-05T08:30:00Z',
  },
  {
    id: 'user-4',
    email: 'alice.johnson@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'USER',
    createdAt: '2024-04-05T12:45:00Z',
    updatedAt: '2024-09-01T15:00:00Z',
  },
  {
    id: 'user-5',
    email: 'charlie.brown@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'USER',
    createdAt: '2024-05-18T08:00:00Z',
    updatedAt: '2024-09-15T10:30:00Z',
  },
];

// ============= SLIDE THEMES MOCK DATA =============
export const MOCK_SLIDE_THEMES: SlideTheme[] = [
  {
    id: 'theme-1',
    name: 'Ocean Blue',
    backgroundColor: '#1a365d',
    themeColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    fontColor: '#ffffff',
    fontName: 'Inter',
    titleFontName: 'Poppins',
    titleFontColor: '#ffffff',
    outline: { style: 'solid', width: 2, color: '#3b82f6' },
    shadow: { h: 2, v: 2, blur: 8, color: 'rgba(0,0,0,0.3)' },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'theme-2',
    name: 'Forest Green',
    backgroundColor: '#14532d',
    themeColors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7'],
    fontColor: '#ffffff',
    fontName: 'Roboto',
    titleFontName: 'Montserrat',
    titleFontColor: '#ecfdf5',
    outline: { style: 'solid', width: 1, color: '#22c55e' },
    shadow: { h: 3, v: 3, blur: 10, color: 'rgba(0,0,0,0.25)' },
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-07-20T11:15:00Z',
  },
  {
    id: 'theme-3',
    name: 'Sunset Orange',
    backgroundColor: {
      type: 'linear',
      colors: [
        { pos: 0, color: '#ea580c' },
        { pos: 1, color: '#dc2626' },
      ],
      rotate: 135,
    },
    themeColors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
    fontColor: '#ffffff',
    fontName: 'Open Sans',
    titleFontName: 'Oswald',
    titleFontColor: '#fff7ed',
    outline: { style: 'dashed', width: 2, color: '#fb923c' },
    shadow: { h: 4, v: 4, blur: 12, color: 'rgba(0,0,0,0.35)' },
    createdAt: '2024-03-12T15:30:00Z',
    updatedAt: '2024-08-10T09:45:00Z',
  },
  {
    id: 'theme-4',
    name: 'Minimalist White',
    backgroundColor: '#ffffff',
    themeColors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'],
    fontColor: '#18181b',
    fontName: 'Lato',
    titleFontName: 'Playfair Display',
    titleFontColor: '#09090b',
    outline: { style: 'solid', width: 1, color: '#d4d4d8' },
    shadow: { h: 1, v: 1, blur: 4, color: 'rgba(0,0,0,0.1)' },
    createdAt: '2024-04-08T11:00:00Z',
    updatedAt: '2024-09-05T16:20:00Z',
  },
];

// ============= SLIDE TEMPLATES MOCK DATA =============
export const MOCK_SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'template-1',
    name: 'Title Slide',
    layout: 'title',
    config: {
      containers: {
        title: { x: 100, y: 200, width: 800, height: 100 },
        subtitle: { x: 100, y: 320, width: 800, height: 60 },
      },
    },
    parameters: [
      { key: 'titleSize', label: 'Title Size', defaultValue: 48, min: 24, max: 72, step: 2 },
      { key: 'subtitleSize', label: 'Subtitle Size', defaultValue: 24, min: 14, max: 36, step: 2 },
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-05-15T12:30:00Z',
  },
  {
    id: 'template-2',
    name: 'Content with Image',
    layout: 'content-image',
    config: {
      containers: {
        title: { x: 50, y: 30, width: 900, height: 60 },
        content: { x: 50, y: 110, width: 450, height: 400 },
        image: { x: 520, y: 110, width: 430, height: 400 },
      },
    },
    parameters: [
      { key: 'contentPadding', label: 'Content Padding', defaultValue: 20, min: 10, max: 40, step: 5 },
      { key: 'imageRadius', label: 'Image Border Radius', defaultValue: 8, min: 0, max: 24, step: 4 },
    ],
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-06-20T09:15:00Z',
  },
  {
    id: 'template-3',
    name: 'Two Column',
    layout: 'two-column',
    config: {
      containers: {
        title: { x: 50, y: 30, width: 900, height: 60 },
        leftColumn: { x: 50, y: 110, width: 430, height: 400 },
        rightColumn: { x: 520, y: 110, width: 430, height: 400 },
      },
    },
    parameters: [{ key: 'columnGap', label: 'Column Gap', defaultValue: 40, min: 20, max: 80, step: 10 }],
    createdAt: '2024-03-05T16:30:00Z',
    updatedAt: '2024-07-25T11:00:00Z',
  },
  {
    id: 'template-4',
    name: 'Quote Slide',
    layout: 'quote',
    config: {
      containers: {
        quote: { x: 100, y: 150, width: 800, height: 200 },
        author: { x: 100, y: 380, width: 800, height: 40 },
      },
    },
    parameters: [{ key: 'quoteSize', label: 'Quote Font Size', defaultValue: 32, min: 20, max: 48, step: 2 }],
    createdAt: '2024-04-15T10:45:00Z',
    updatedAt: '2024-08-30T14:20:00Z',
  },
];

// ============= ART STYLES MOCK DATA =============
// Mock CDN URL base - simulates R2 storage URLs
const MOCK_CDN_BASE = 'https://cdn.example.com/artStyles';

export const MOCK_ART_STYLES: ArtStyle[] = [
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    labelKey: 'photorealistic',
    visual: `${MOCK_CDN_BASE}/photorealistic.jpg`,
    modifiers: 'ultra realistic, highly detailed, 8k resolution, sharp focus, professional photography',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    labelKey: 'digitalArt',
    visual: `${MOCK_CDN_BASE}/digital-art.jpg`,
    modifiers: 'digital painting, vibrant colors, detailed, artstation trending',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    labelKey: 'oilPainting',
    visual: `${MOCK_CDN_BASE}/oil-painting.jpg`,
    modifiers: 'oil on canvas, brush strokes visible, classical technique, rich colors',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    labelKey: 'watercolor',
    visual: `${MOCK_CDN_BASE}/watercolor.jpg`,
    modifiers: 'watercolor painting, soft edges, flowing colors, paper texture',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'anime',
    name: 'Anime',

    labelKey: 'anime',
    visual: `${MOCK_CDN_BASE}/anime.jpg`,
    modifiers: 'anime style, manga, cel shading, vibrant colors, detailed eyes',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',

    labelKey: 'cartoon',
    visual: `${MOCK_CDN_BASE}/cartoon.jpg`,
    modifiers: 'cartoon style, bold outlines, flat colors, exaggerated features',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'sketch',
    name: 'Sketch',

    labelKey: 'sketch',
    visual: `${MOCK_CDN_BASE}/sketch.jpg`,
    modifiers: 'pencil sketch, hand drawn, line art, rough strokes, hatching',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'abstract',
    name: 'Abstract',

    labelKey: 'abstract',
    visual: `${MOCK_CDN_BASE}/abstract.jpg`,
    modifiers: 'abstract art, geometric shapes, bold colors, non-representational',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'surreal',
    name: 'Surreal',

    labelKey: 'surreal',
    visual: `${MOCK_CDN_BASE}/surreal.jpg`,
    modifiers: 'surrealism, dreamlike, Salvador Dali inspired, impossible scenes',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',

    labelKey: 'minimalist',
    visual: `${MOCK_CDN_BASE}/minimalist.jpg`,
    modifiers: 'minimalist design, simple shapes, limited color palette, clean lines',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
];

// ============= AI MODELS MOCK DATA =============
export const MOCK_MODELS: Model[] = [
  {
    id: 'model-1',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    enabled: true,
    default: true,
    provider: 'OpenAI',
    type: 'TEXT',
  },
  {
    id: 'model-2',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: false,
    provider: 'OpenAI',
    type: 'TEXT',
  },
  {
    id: 'model-3',
    name: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    enabled: true,
    default: false,
    provider: 'Anthropic',
    type: 'TEXT',
  },
  {
    id: 'model-4',
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    enabled: false,
    default: false,
    provider: 'Google',
    type: 'TEXT',
  },
  {
    id: 'model-5',
    name: 'dall-e-3',
    displayName: 'DALL-E 3',
    enabled: true,
    default: true,
    provider: 'OpenAI',
    type: 'IMAGE',
  },
  {
    id: 'model-6',
    name: 'stable-diffusion-xl',
    displayName: 'Stable Diffusion XL',
    enabled: true,
    default: false,
    provider: 'Stability AI',
    type: 'IMAGE',
  },
];

// ============= FAQ POSTS MOCK DATA =============
export const MOCK_FAQ_POSTS: FAQPost[] = [
  {
    id: 'faq-1',
    title: 'How do I create a new presentation?',
    content: `To create a new presentation, follow these steps:

1. Click the "New Presentation" button on the dashboard
2. Choose a template or start from scratch
3. Add your content using the slide editor
4. Save and share your presentation

You can also import existing presentations from PowerPoint or Google Slides.`,
    category: 'Getting Started',
    isPublished: true,
    order: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'faq-2',
    title: 'What AI features are available?',
    content: `Our platform offers several AI-powered features:

- **Content Generation**: AI can help you generate slide content based on topics
- **Image Generation**: Create custom images using AI
- **Design Suggestions**: Get layout and design recommendations
- **Translation**: Automatically translate your presentations
- **Summary**: Generate summaries of long presentations`,
    category: 'AI Features',
    isPublished: true,
    order: 2,
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-07-20T11:15:00Z',
  },
  {
    id: 'faq-3',
    title: 'How do I share my presentation?',
    content: `You can share your presentation in multiple ways:

1. **Public Link**: Generate a shareable link anyone can view
2. **Email Invite**: Send direct invitations to collaborators
3. **Embed**: Get an embed code for websites
4. **Export**: Download as PDF, PPTX, or images

Access the sharing options by clicking the "Share" button in the presentation editor.`,
    category: 'Sharing',
    isPublished: true,
    order: 3,
    createdAt: '2024-03-12T15:30:00Z',
    updatedAt: '2024-08-10T09:45:00Z',
  },
  {
    id: 'faq-4',
    title: 'How do I upgrade my account?',
    content: `To upgrade your account:

1. Go to Settings > Subscription
2. Compare available plans
3. Select your preferred plan
4. Complete the payment process

You can upgrade or downgrade your plan at any time. Changes take effect immediately.`,
    category: 'Account',
    isPublished: false,
    order: 4,
    createdAt: '2024-04-08T11:00:00Z',
    updatedAt: '2024-09-05T16:20:00Z',
  },
  {
    id: 'faq-5',
    title: 'What file formats can I import?',
    content: `We support the following file formats for import:

- **PowerPoint**: .pptx, .ppt
- **Google Slides**: Direct import via Google account
- **PDF**: Convert PDF files to editable presentations
- **Images**: .png, .jpg, .svg for individual slides

Simply drag and drop files or use the Import button in the dashboard.`,
    category: 'Getting Started',
    isPublished: true,
    order: 5,
    createdAt: '2024-05-20T13:00:00Z',
    updatedAt: '2024-09-10T10:30:00Z',
  },
];

// ============= BOOKS MOCK DATA =============
export const MOCK_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Mathematics Grade 10',
    description:
      'Comprehensive mathematics textbook covering algebra, geometry, and statistics for grade 10 students.',
    type: 'TEXTBOOK',
    grade: '10',
    subject: 'Mathematics',
    publisher: 'Education Press',
    pdfUrl: '/uploads/books/math-grade-10.pdf',
    thumbnailUrl: '/uploads/thumbnails/math-grade-10.jpg',
    isPublished: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'book-2',
    title: 'Physics Grade 11',
    description: 'Complete physics curriculum including mechanics, thermodynamics, and electromagnetism.',
    type: 'TEXTBOOK',
    grade: '11',
    subject: 'Physics',
    publisher: 'Science Books Inc.',
    pdfUrl: '/uploads/books/physics-grade-11.pdf',
    thumbnailUrl: '/uploads/thumbnails/physics-grade-11.jpg',
    isPublished: true,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-07-15T11:15:00Z',
  },
  {
    id: 'book-3',
    title: 'English Literature Guide',
    description: 'Teacher guide for English literature curriculum with lesson plans and assessments.',
    type: 'TEACHERBOOK',
    grade: '10-12',
    subject: 'English',
    publisher: 'Language Arts Publishing',
    pdfUrl: '/uploads/books/english-teacher-guide.pdf',
    thumbnailUrl: '/uploads/thumbnails/english-teacher-guide.jpg',
    isPublished: true,
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-08-10T09:45:00Z',
  },
  {
    id: 'book-4',
    title: 'Chemistry Lab Manual',
    description: 'Practical chemistry experiments and procedures for laboratory sessions.',
    type: 'TEXTBOOK',
    grade: '11',
    subject: 'Chemistry',
    publisher: 'Science Books Inc.',
    pdfUrl: '/uploads/books/chemistry-lab-manual.pdf',
    thumbnailUrl: '/uploads/thumbnails/chemistry-lab.jpg',
    isPublished: false,
    createdAt: '2024-04-12T16:30:00Z',
    updatedAt: '2024-09-01T15:00:00Z',
  },
  {
    id: 'book-5',
    title: 'History Teaching Guide',
    description: 'Comprehensive teaching guide for world history with interactive activities.',
    type: 'TEACHERBOOK',
    grade: '9-10',
    subject: 'History',
    publisher: 'Humanities Press',
    pdfUrl: '/uploads/books/history-teacher-guide.pdf',
    thumbnailUrl: '/uploads/thumbnails/history-guide.jpg',
    isPublished: true,
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-09-15T12:30:00Z',
  },
];

// ============= HELPER FUNCTIONS =============

/**
 * Simulate network delay
 */
export const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate pagination response
 */
export const paginate = <T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): { data: T[]; pagination: Pagination } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalItems,
    },
  };
};

/**
 * Generate a unique ID
 */
export const generateId = (prefix: string = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
