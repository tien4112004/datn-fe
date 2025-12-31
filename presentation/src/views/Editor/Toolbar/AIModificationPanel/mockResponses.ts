/**
 * Mock Response Generators
 *
 * These functions generate mock AI responses for different action types.
 * Replace with actual AI responses in production.
 */

export function generateMockResponse(
  actionId: string,
  context: { type: string; slideId?: string; elementId?: string | string[] },
  parameters: Record<string, string | number>
): { modifiedContent?: unknown; newSlides?: unknown[]; suggestions?: unknown[] } {
  switch (actionId) {
    // Text Actions
    case 'improve-writing':
      return {
        modifiedContent: generateImprovedText(parameters.tone as string, parameters.style as string),
      };

    case 'translate-content':
      return {
        modifiedContent: generateTranslatedText(parameters.targetLanguage as string),
      };

    case 'summarize-slide':
      return {
        modifiedContent: generateSummarizedText(parameters.length as string),
      };

    case 'expand-content':
      return {
        modifiedContent: generateExpandedText(parameters.depth as string),
      };

    case 'rewrite-text':
      return {
        modifiedContent: generateRewrittenText(parameters.tone as string, parameters.length as string),
      };

    case 'fix-grammar':
      return {
        modifiedContent:
          '[AI Fixed] Grammar and spelling corrected with ' + parameters.formality + ' formality.',
      };

    case 'change-tone':
      return {
        modifiedContent: '[AI Modified] Tone changed to ' + parameters.tone + ' style.',
      };

    case 'bullet-conversion':
      return {
        modifiedContent: generateBulletConversion(parameters.format as string),
      };

    // Design Actions
    case 'redesign-layout':
      return {
        suggestions: generateLayoutSuggestions(parameters.stylePreference as string),
      };

    case 'enhance-hierarchy':
      return {
        modifiedContent: {
          message: `Visual hierarchy enhanced with ${parameters.emphasisLevel} emphasis`,
          changes: ['Title size increased by 20%', 'Subtitle made bold', 'Content spacing optimized'],
        },
      };

    case 'suggest-color-scheme':
      return {
        suggestions: generateColorSchemeSuggestions(parameters.mood as string),
      };

    // Image Actions
    case 'generate-alt-text':
      return {
        modifiedContent: generateAltText(parameters.detailLevel as string),
      };

    case 'suggest-similar':
      return {
        suggestions: generateImageSuggestions(parameters.source as string),
      };

    case 'enhance-image':
      return {
        modifiedContent: {
          message: `Image enhanced with ${parameters.enhancementType}`,
          adjustment: parameters.enhancementType,
        },
      };

    // Multi-element Actions
    case 'align-balance':
      return {
        modifiedContent: {
          message: `Elements aligned in ${parameters.layoutPreference} layout`,
          layout: parameters.layoutPreference,
        },
      };

    case 'create-grouping':
      return {
        suggestions: generateGroupingSuggestions(parameters.groupBy as string),
      };

    // Generation Actions
    case 'generate-from-topic':
      return {
        newSlides: generateSlidesFromTopic(
          parameters.topic as string,
          parameters.slideCount as number,
          parameters.stylePreference as string
        ),
      };

    case 'expand-slide':
      return {
        newSlides: generateExpandedSlides(parameters.slideCount as number, parameters.focusArea as string),
      };

    case 'create-conclusion':
      return {
        newSlides: generateConclusionSlide(parameters.format as string),
      };

    case 'create-agenda':
      return {
        newSlides: generateAgendaSlide(parameters.format as string, parameters.includeSlideNumbers as string),
      };

    default:
      return {
        modifiedContent: '[AI Mock] Action processed successfully.',
      };
  }
}

// Helper functions for generating mock content

function generateImprovedText(tone: string, style: string): string {
  return `[AI Improved - ${tone} tone, ${style} style]\n\nThis text has been enhanced for better clarity, grammar, and style. The content now flows more naturally and effectively communicates the key message.`;
}

function generateTranslatedText(language: string): string {
  const languageNames: Record<string, string> = {
    vi: 'Vietnamese',
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
  };
  return `[AI Translated to ${languageNames[language] || language}]\n\nTranslated content would appear here...`;
}

function generateSummarizedText(length: string): string {
  const summaries: Record<string, string> = {
    brief: '• Key point 1\n• Key point 2',
    moderate:
      '• Key point 1: detailed explanation\n• Key point 2: detailed explanation\n• Key point 3: additional insight',
    detailed:
      '• Key point 1: comprehensive explanation with context\n• Key point 2: detailed breakdown with examples\n• Key point 3: additional insights and implications',
  };
  return `[AI Summarized - ${length}]\n\n${summaries[length] || summaries.moderate}`;
}

function generateExpandedText(depth: string): string {
  const expansions: Record<string, string> = {
    light: 'This concept is important because it provides foundational understanding.',
    moderate:
      'This concept is important because it provides foundational understanding. It connects to several key principles and has practical applications in real-world scenarios.',
    comprehensive:
      'This concept is important because it provides foundational understanding. It connects to several key principles and has practical applications in real-world scenarios. Furthermore, it serves as a building block for more advanced topics and enables deeper analysis of complex problems.',
  };
  return `[AI Expanded - ${depth} depth]\n\n${expansions[depth] || expansions.moderate}`;
}

function generateRewrittenText(tone: string, length: string): string {
  return `[AI Rewritten - ${tone} tone, ${length} length]\n\nThis is the rewritten version of your text with the requested tone and length adjustments.`;
}

function generateBulletConversion(format: string): string {
  const formats: Record<string, string> = {
    bullets: '• First point\n• Second point\n• Third point',
    numbered: '1. First point\n2. Second point\n3. Third point',
    paragraph:
      'This paragraph combines all the key points into a flowing narrative that presents the information in a cohesive manner.',
  };
  return `[AI Converted to ${format}]\n\n${formats[format] || formats.bullets}`;
}

function generateLayoutSuggestions(style: string): Array<{ name: string; description: string }> {
  return [
    {
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Layout Option 1`,
      description: 'Centered content with large visual hierarchy',
    },
    {
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Layout Option 2`,
      description: 'Split layout with image on left, text on right',
    },
    {
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Layout Option 3`,
      description: 'Grid-based layout with multiple content sections',
    },
  ];
}

function generateColorSchemeSuggestions(mood: string): Array<{ name: string; colors: string[] }> {
  const schemes: Record<string, Array<{ name: string; colors: string[] }>> = {
    professional: [
      { name: 'Corporate Blue', colors: ['#0066CC', '#004C99', '#99CCFF'] },
      { name: 'Modern Gray', colors: ['#333333', '#666666', '#CCCCCC'] },
    ],
    creative: [
      { name: 'Vibrant Rainbow', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'] },
      { name: 'Sunset Gradient', colors: ['#FF6F61', '#FFB347', '#FF8C94'] },
    ],
    energetic: [
      { name: 'Bold Contrast', colors: ['#FF0055', '#00FFAA', '#FFAA00'] },
      { name: 'Electric Neon', colors: ['#00FF00', '#FF00FF', '#00FFFF'] },
    ],
  };
  return schemes[mood] || schemes.professional;
}

function generateAltText(detailLevel: string): string {
  const texts: Record<string, string> = {
    brief: 'A professional business chart',
    moderate: 'A professional business chart showing quarterly growth trends',
    detailed:
      'A comprehensive business chart displaying quarterly growth trends across multiple product lines, with annotations highlighting key performance indicators and market insights',
  };
  return `[AI Generated Alt Text - ${detailLevel}]\n\n${texts[detailLevel] || texts.moderate}`;
}

function generateImageSuggestions(source: string): Array<{ url: string; description: string }> {
  return [
    { url: '/mock-image-1.jpg', description: `Similar image from ${source} - Option 1` },
    { url: '/mock-image-2.jpg', description: `Similar image from ${source} - Option 2` },
    { url: '/mock-image-3.jpg', description: `Similar image from ${source} - Option 3` },
  ];
}

function generateGroupingSuggestions(groupBy: string): Array<{ name: string; elements: string[] }> {
  return [
    {
      name: `Group by ${groupBy} - Option 1`,
      elements: ['Element A', 'Element B', 'Element C'],
    },
    {
      name: `Group by ${groupBy} - Option 2`,
      elements: ['Element D', 'Element E'],
    },
  ];
}

function generateSlidesFromTopic(
  topic: string,
  count: number,
  style: string
): Array<{ title: string; content: string }> {
  const slides = [];
  for (let i = 1; i <= count; i++) {
    slides.push({
      title: `${topic} - Part ${i}`,
      content: `[AI Generated Slide ${i} in ${style} style]\n\nContent about ${topic} would appear here with relevant information and visuals.`,
    });
  }
  return slides;
}

function generateExpandedSlides(count: number, focusArea: string): Array<{ title: string; content: string }> {
  const slides = [];
  const focus = focusArea || 'the main topic';
  for (let i = 1; i <= count; i++) {
    slides.push({
      title: `Expanding on ${focus} - Slide ${i}`,
      content: `[AI Generated Supporting Slide ${i}]\n\nDetailed information supporting ${focus}.`,
    });
  }
  return slides;
}

function generateConclusionSlide(format: string): Array<{ title: string; content: string }> {
  return [
    {
      title: 'Conclusion',
      content: `[AI Generated Conclusion in ${format} format]\n\n• Key Takeaway 1\n• Key Takeaway 2\n• Key Takeaway 3\n• Next Steps`,
    },
  ];
}

function generateAgendaSlide(
  format: string,
  includeNumbers: string
): Array<{ title: string; content: string }> {
  const withNumbers = includeNumbers === 'yes';
  const content = withNumbers
    ? `[AI Generated Agenda with slide numbers]\n\n${format === 'numbered' ? '1' : '•'} Introduction (Slide 2)\n${format === 'numbered' ? '2' : '•'} Main Topic (Slide 3)\n${format === 'numbered' ? '3' : '•'} Conclusion (Slide 10)`
    : `[AI Generated Agenda]\n\n${format === 'numbered' ? '1' : '•'} Introduction\n${format === 'numbered' ? '2' : '•'} Main Topic\n${format === 'numbered' ? '3' : '•'} Conclusion`;

  return [
    {
      title: 'Agenda',
      content,
    },
  ];
}
