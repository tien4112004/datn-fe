/**
 * Sample data generators for slide layout previews
 */

import type { LayoutType } from './constants';

/**
 * Generate sample template data based on layout type for preview
 */
export function generateSampleTemplateData(layout: LayoutType): Record<string, unknown> {
  const layoutConfigs: Record<LayoutType, Record<string, unknown>> = {
    title: {
      type: 'title',
      data: {
        title: 'Designing Effective Presentations: A Comprehensive Overview',
        subtitle:
          'An engaging subtitle that summarizes the main focus, objectives, and intended audience in a single sentence to set expectations.',
      },
    },
    list: {
      type: 'list',
      title: 'Key Points and Highlights',
      data: {
        items: [
          'The first point introduces the primary objective and explains why it matters to the audience.',
          'The second point provides supporting evidence and examples that reinforce the main idea.',
          'The third point discusses practical considerations and potential challenges to watch for.',
          'The fourth point summarizes next steps, recommendations, and calls to action.',
        ],
      },
    },
    labeled_list: {
      type: 'labeled_list',
      title: 'Detailed Items with Descriptions',
      data: {
        items: [
          {
            label: 'Overview',
            content:
              'A concise summary that outlines the purpose, scope, and high-level outcomes expected from this initiative.',
          },
          {
            label: 'Details',
            content:
              'In-depth information including methods, data sources, and the reasoning behind key decisions.',
          },
          {
            label: 'Next Steps',
            content:
              'Recommended actions, timelines, and responsible parties to move the project forward effectively.',
          },
        ],
      },
    },
    two_column: {
      type: 'two_column',
      title: 'Two-Column Comparison of Ideas',
      data: {
        items1: [
          'Left column point explains the concept and rationale with contextual examples.',
          'Left column point provides supporting evidence and relevant metrics.',
          'Left column point outlines implementation considerations and potential risks.',
        ],
        items2: [
          'Right column point offers a contrasting perspective highlighting benefits and trade-offs.',
          'Right column point suggests alternative approaches and their projected impacts.',
          'Right column point summarizes implications for stakeholders and decision criteria.',
        ],
      },
    },
    two_column_with_image: {
      type: 'two_column_with_image',
      title: 'Features Highlighted with Visual',
      data: {
        items: [
          'Feature one describes the user benefit, use cases, and why it matters.',
          'Feature two elaborates on technical details, performance, and reliability aspects.',
          'Feature three outlines integration steps and recommended best practices for adoption.',
        ],
        image: 'https://placehold.co/400x300',
      },
    },
    main_image: {
      type: 'main_image',
      data: {
        title: 'Visual Summary and Key Message',
        image: 'https://placehold.co/800x400',
        content:
          'A clear caption that explains the image context, highlights the most important detail, and connects it to the slide’s main message.',
      },
    },
    table_of_contents: {
      type: 'table_of_contents',
      title: 'Presentation Roadmap',
      data: {
        items: [
          'Introduction — background, objectives, and what to expect from the presentation',
          'Main Concepts — core principles and frameworks to understand the subject',
          'Implementation — practical steps, timelines, and resources required',
          'Results and Discussion — findings, interpretations, and lessons learned',
          'Conclusion — summary, recommendations, and next steps for the audience',
        ],
      },
    },
    timeline: {
      type: 'timeline',
      title: 'Project Timeline and Milestones',
      data: {
        items: [
          {
            year: 2020,
            description:
              'Project initiated with stakeholder alignment, requirements gathering, and initial planning activities.',
          },
          {
            year: 2021,
            description:
              'Iterative development and testing cycles with continuous feedback and quality assurance.',
          },
          {
            year: 2022,
            description:
              'Official launch and deployment, including monitoring, user onboarding, and stabilization.',
          },
          {
            year: 2023,
            description:
              'Growth, scaling efforts, and evaluation of adoption metrics and performance improvements.',
          },
        ],
      },
    },
    pyramid: {
      type: 'pyramid',
      title: 'Organizational Hierarchy Pyramid',
      data: {
        items: [
          'Executive leadership setting strategy and long-term vision',
          'Senior managers translating strategy into programs and key initiatives',
          'Operational teams executing projects and delivering results',
          'Support functions and foundational resources that enable sustainable operations',
        ],
      },
    },
  };

  return layoutConfigs[layout] || layoutConfigs.title;
}
