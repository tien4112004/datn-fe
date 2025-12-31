/**
 * Sample data generators for slide layout previews
 */

import type { LayoutType } from './constants';

/**
 * Test scenario types for template testing
 */
export type TestScenario = 'normal' | 'short' | 'long' | 'edge';

/**
 * Generate sample template data based on layout type for preview
 */
export function generateSampleTemplateData(
  layout: LayoutType,
  scenario: TestScenario = 'normal'
): Record<string, unknown> {
  if (scenario === 'short') {
    return generateShortTextData(layout);
  } else if (scenario === 'long') {
    return generateLongTextData(layout);
  } else if (scenario === 'edge') {
    return generateEdgeCaseData(layout);
  }
  return generateNormalTextData(layout);
}

/**
 * Short text variants - minimal content
 */
function generateShortTextData(layout: LayoutType): Record<string, unknown> {
  const layoutConfigs: Record<LayoutType, Record<string, unknown>> = {
    title: {
      type: 'title',
      data: {
        title: 'Title',
        subtitle: 'Subtitle',
      },
    },
    list: {
      type: 'list',
      title: 'List',
      data: {
        items: ['First', 'Second', 'Third', 'Fourth'],
      },
    },
    labeled_list: {
      type: 'labeled_list',
      title: 'Items',
      data: {
        items: [
          { label: 'One', content: 'Content one' },
          { label: 'Two', content: 'Content two' },
          { label: 'Three', content: 'Content three' },
        ],
      },
    },
    two_column: {
      type: 'two_column',
      title: 'Comparison',
      data: {
        items1: ['Left one', 'Left two', 'Left three'],
        items2: ['Right one', 'Right two', 'Right three'],
      },
    },
    two_column_with_image: {
      type: 'two_column_with_image',
      title: 'Features',
      data: {
        items: ['Feature A', 'Feature B', 'Feature C'],
        image: 'https://placehold.co/400x300',
      },
    },
    main_image: {
      type: 'main_image',
      data: {
        title: 'Visual',
        image: 'https://placehold.co/800x400',
        content: 'Caption',
      },
    },
    table_of_contents: {
      type: 'table_of_contents',
      title: 'Contents',
      data: {
        items: ['Intro', 'Main', 'Steps', 'Results', 'End'],
      },
    },
    timeline: {
      type: 'timeline',
      title: 'Timeline',
      data: {
        items: [
          { label: 2020, content: 'Start' },
          { label: 2021, content: 'Dev' },
          { label: 2022, content: 'Launch' },
          { label: 2023, content: 'Growth' },
        ],
      },
    },
    pyramid: {
      type: 'pyramid',
      title: 'Hierarchy',
      data: {
        items: ['Top', 'Middle', 'Base', 'Foundation'],
      },
    },
  };

  return layoutConfigs[layout] || layoutConfigs.title;
}

/**
 * Long text variants - extensive content
 */
function generateLongTextData(layout: LayoutType): Record<string, unknown> {
  const layoutConfigs: Record<LayoutType, Record<string, unknown>> = {
    title: {
      type: 'title',
      data: {
        title:
          'An Extraordinarily Comprehensive and Detailed Analysis of Modern Presentation Design Methodologies, Best Practices, and Advanced Techniques for Creating Impactful Visual Communications in Professional Business Environments',
        subtitle:
          'This extensively detailed subtitle provides an in-depth exploration of the fundamental principles, advanced strategies, and cutting-edge methodologies employed by industry-leading professionals to create compelling, engaging, and memorable presentations that effectively communicate complex ideas, drive meaningful conversations, influence decision-making processes, and ultimately achieve strategic business objectives while maintaining audience engagement throughout the entire presentation lifecycle and ensuring maximum information retention and actionable outcomes.',
      },
    },
    list: {
      type: 'list',
      title: 'Comprehensive Analysis of Critical Success Factors and Strategic Implementation Points',
      data: {
        items: [
          'The foundational first point comprehensively introduces the primary strategic objective, establishes clear success criteria, explains in exhaustive detail why this particular approach matters significantly to the target audience, provides extensive background context including historical precedents, outlines potential implications across multiple organizational levels, and demonstrates through numerous real-world examples how this principle has been successfully applied in diverse industry sectors to achieve measurable results.',
          'The extensively detailed second point provides comprehensive supporting evidence drawn from peer-reviewed research, authoritative industry reports, quantitative data analysis, qualitative case studies, expert testimonials, and empirical observations that collectively reinforce and validate the central thesis, while simultaneously addressing potential counterarguments, acknowledging legitimate concerns, and offering nuanced perspectives that demonstrate intellectual rigor and comprehensive understanding of the complex ecosystem.',
          'The thoroughly exhaustive third point meticulously discusses critical practical considerations, potential implementation challenges, risk mitigation strategies, resource allocation requirements, timeline dependencies, stakeholder engagement protocols, change management frameworks, communication strategies, monitoring mechanisms, performance indicators, adjustment procedures, and comprehensive contingency plans that organizations must carefully evaluate and address.',
          'The culminating fourth point synthesizes all preceding information, summarizes recommended next steps with specific action items, provides detailed implementation roadmaps, identifies key stakeholders and their respective responsibilities, establishes clear timelines and milestones, defines success metrics and evaluation criteria, and articulates compelling calls to action that motivate immediate engagement.',
        ],
      },
    },
    labeled_list: {
      type: 'labeled_list',
      title: 'Extensively Detailed Items with Comprehensive In-Depth Descriptions and Analysis',
      data: {
        items: [
          {
            label: 'Comprehensive Strategic Overview and Executive Summary',
            content:
              'An exceptionally detailed and meticulously crafted summary that comprehensively outlines the overarching strategic purpose, clearly defines the complete scope of work including all deliverables and milestones, articulates high-level outcomes expected from this transformative initiative, provides extensive context regarding organizational alignment, identifies key stakeholder groups and their specific interests, addresses critical success factors, and establishes clear performance indicators.',
          },
          {
            label: 'Granular Implementation Details and Methodological Framework',
            content:
              'Extraordinarily comprehensive and extensively detailed information encompassing rigorous methodological approaches, authoritative data sources with full provenance documentation, transparent analytical frameworks, detailed reasoning behind every significant decision point, extensive justification for chosen strategies, thorough documentation of alternative approaches considered and rejected with clear rationale, and complete traceability of all assumptions.',
          },
          {
            label: 'Strategic Next Steps, Action Items, and Long-term Implementation Roadmap',
            content:
              'Meticulously documented and prioritized recommended actions with specific ownership assignments, detailed implementation timelines including dependencies and critical path analysis, identification of responsible parties with their roles and authorities clearly defined, comprehensive resource requirements including budget allocations, risk assessment and mitigation strategies, and strategic recommendations designed to move the transformative project forward effectively.',
          },
        ],
      },
    },
    two_column: {
      type: 'two_column',
      title: 'Comprehensive Two-Column Comparative Analysis of Contrasting Perspectives and Approaches',
      data: {
        items1: [
          'The left column comprehensively explains the foundational concept in exhaustive detail, provides extensive rationale including theoretical underpinnings, offers numerous contextual examples drawn from diverse industries, discusses implementation considerations across various organizational contexts, and thoroughly analyzes potential challenges and mitigation strategies.',
          'This left column point provides extensive supporting evidence including quantitative metrics, qualitative assessments, industry benchmarks, historical trends, predictive analytics, and relevant comparative data that collectively validate the proposed approach and demonstrate measurable value.',
          'The concluding left column point meticulously outlines detailed implementation considerations, addresses potential risks with specific mitigation strategies, discusses resource requirements and allocation frameworks, and provides comprehensive guidance for successful execution.',
        ],
        items2: [
          'The corresponding right column point offers an extensively detailed contrasting perspective that comprehensively highlights significant benefits, carefully analyzes important trade-offs including short-term costs versus long-term gains, discusses strategic implications across multiple dimensions, and provides nuanced recommendations.',
          'This right column entry suggests comprehensive alternative approaches with detailed implementation guidance, discusses their projected impacts across various stakeholder groups, provides extensive cost-benefit analysis, evaluates strategic alignment, and offers scenario planning frameworks.',
          'The final right column point provides an exhaustive summary of critical implications for all stakeholder groups, establishes comprehensive decision criteria including weighted factors, offers detailed evaluation frameworks, and presents strategic recommendations.',
        ],
      },
    },
    two_column_with_image: {
      type: 'two_column_with_image',
      title: 'Comprehensive Feature Analysis Highlighted with Supporting Visual Documentation',
      data: {
        items: [
          'The first extensively detailed feature comprehensively describes the significant user benefit in exhaustive detail, provides numerous real-world use cases across diverse contexts, explains comprehensively why this particular capability matters strategically, discusses implementation considerations, and addresses potential adoption challenges.',
          'The second thoroughly documented feature elaborates extensively on critical technical details including architectural considerations, discusses comprehensive performance characteristics with quantitative benchmarks, addresses reliability aspects including failover mechanisms, and provides detailed integration guidance.',
          'The third meticulously crafted feature outlines comprehensive integration steps with detailed prerequisites, provides extensively documented recommended best practices based on industry standards, discusses potential challenges with specific mitigation strategies, and offers guidance for successful adoption.',
        ],
        image: 'https://placehold.co/400x300',
      },
    },
    main_image: {
      type: 'main_image',
      data: {
        title:
          'Comprehensive Visual Summary with Extensive Contextual Information and Detailed Key Message Communication',
        image: 'https://placehold.co/800x400',
        content:
          'An extraordinarily detailed and meticulously crafted caption that comprehensively explains the complete image context including background, setting, and circumstances, systematically highlights every important detail visible within the visual representation, provides extensive analytical commentary on the significance of various elements, draws clear and compelling connections between the visual content and the overarching slide message, offers additional insights that enhance understanding, and ensures that viewers fully appreciate the relevance and importance of this particular visual asset.',
      },
    },
    table_of_contents: {
      type: 'table_of_contents',
      title: 'Comprehensive Presentation Roadmap with Detailed Section Descriptions',
      data: {
        items: [
          'Comprehensive Introduction — extensive background information including historical context and industry landscape, clearly articulated strategic objectives with measurable success criteria, detailed description of what participants should expect from the presentation, and overview of the journey ahead',
          'Foundational Concepts and Theoretical Frameworks — comprehensive exploration of core principles with supporting research, detailed examination of relevant frameworks including their strengths and limitations, extensive discussion of theoretical underpinnings, and practical applications',
          'Detailed Implementation Strategy and Execution Plan — specific practical steps with clear action items, comprehensive timelines including milestones and dependencies, detailed resource requirements including budget and staffing, risk assessment and mitigation strategies',
          'Comprehensive Results Analysis and In-Depth Discussion — detailed findings with supporting data and visualizations, nuanced interpretations considering multiple perspectives, systematic documentation of lessons learned, and implications for future initiatives',
          'Executive Summary and Strategic Recommendations — comprehensive summary synthesizing all key points, detailed strategic recommendations with implementation guidance, clearly defined next steps with ownership and timelines, and compelling calls to action',
        ],
      },
    },
    timeline: {
      type: 'timeline',
      title: 'Comprehensive Project Timeline with Detailed Milestone Descriptions and Analysis',
      data: {
        items: [
          {
            label: 2020,
            content:
              'Comprehensive project initiation phase including extensive stakeholder alignment activities, detailed requirements gathering through multiple workshops and interviews, comprehensive initial planning activities including resource allocation and risk assessment, establishment of governance structures, and creation of detailed project charters.',
          },
          {
            label: 2021,
            content:
              'Extensive iterative development and comprehensive testing cycles incorporating continuous stakeholder feedback, rigorous quality assurance protocols including automated and manual testing, multiple user acceptance testing phases, performance optimization efforts, and comprehensive documentation development.',
          },
          {
            label: 2022,
            content:
              'Official production launch and comprehensive deployment activities including phased rollout strategies, extensive monitoring and alerting infrastructure, detailed user onboarding programs with multiple training sessions, comprehensive stabilization efforts including rapid response to issues, and ongoing optimization.',
          },
          {
            label: 2023,
            content:
              'Significant growth initiatives and comprehensive scaling efforts including infrastructure expansion, detailed evaluation of adoption metrics across user segments, thorough analysis of performance improvements and optimization opportunities, and strategic planning for future enhancements.',
          },
        ],
      },
    },
    pyramid: {
      type: 'pyramid',
      title: 'Comprehensive Organizational Hierarchy Pyramid with Detailed Level Descriptions',
      data: {
        items: [
          'Executive leadership team responsible for establishing comprehensive strategic direction, defining long-term organizational vision and mission, making critical resource allocation decisions, and ensuring alignment across all business units',
          'Senior management responsible for translating high-level strategy into specific programs, defining key strategic initiatives with clear objectives, allocating resources effectively, and ensuring successful execution',
          'Operational teams responsible for executing detailed projects according to specifications, delivering concrete results that align with strategic objectives, managing day-to-day activities, and maintaining quality standards',
          'Support functions and foundational resources that enable sustainable operations including infrastructure, administrative services, knowledge management systems, and other critical capabilities',
        ],
      },
    },
  };

  return layoutConfigs[layout] || layoutConfigs.title;
}

/**
 * Edge case variants - testing boundary conditions
 */
function generateEdgeCaseData(layout: LayoutType): Record<string, unknown> {
  const layoutConfigs: Record<LayoutType, Record<string, unknown>> = {
    title: {
      type: 'title',
      data: {
        title:
          'Supercalifragilisticexpialidocious-Pneumonoultramicroscopicsilicovolcanoconiosis-Antidisestablishmentarianism',
        subtitle: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
      },
    },
    list: {
      type: 'list',
      title: 'Edge Cases: Special Characters & Empty Values',
      data: {
        items: [
          '',
          'SingleVeryLongWordWithoutAnySpacesOrBreaksToTestTextWrappingAndOverflowBehaviorInTheLayoutEngine',
          '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
          'Normal text',
          '🎨🎭🎪🎬🎮🎯🎲🎳🎴🎵🎶🎷🎸🎹🎺🎻🎼🎽🎾🎿🏀🏁🏂',
        ],
      },
    },
    labeled_list: {
      type: 'labeled_list',
      title: 'Edge: Long Labels & Special Chars',
      data: {
        items: [
          { label: '', content: 'Empty label test case' },
          {
            label: 'VeryLongLabelWithoutSpaces',
            content: 'Testing label overflow',
          },
          { label: '🎨 Emoji', content: 'Emoji in label: 🎭🎪🎬🎮' },
          { label: '!@#$', content: 'Special chars: <>&"\'{}[]' },
        ],
      },
    },
    two_column: {
      type: 'two_column',
      title: 'Edge: Asymmetric & Special Content',
      data: {
        items1: ['', 'VeryLongWordWithoutSpacesTestingOverflow', 'Short'],
        items2: [
          'Much longer text on the right side to test asymmetric content handling',
          '!@#$%^&*()',
          'Short',
          'Extra item to test uneven lists',
          'Another extra',
        ],
      },
    },
    two_column_with_image: {
      type: 'two_column_with_image',
      title: 'Edge: Empty & Special',
      data: {
        items: [
          '',
          'VeryLongFeatureNameWithoutAnySpacesOrBreaks',
          '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
          '🎨🎭🎪 Emojis',
        ],
        image: 'https://placehold.co/400x300',
      },
    },
    main_image: {
      type: 'main_image',
      data: {
        title: '',
        image: 'https://placehold.co/800x400',
        content: 'VeryLongCaptionWithoutAnySpacesTestingTextWrappingAndOverflowHandling!@#$%^&*()🎨🎭',
      },
    },
    table_of_contents: {
      type: 'table_of_contents',
      title: 'Edge: Special Characters',
      data: {
        items: [
          '',
          'VeryLongSectionNameWithoutSpacesTestingOverflow — description',
          '!@#$%^&*() — special chars',
          '🎨🎭🎪 — emojis',
          'Normal — text',
        ],
      },
    },
    timeline: {
      type: 'timeline',
      title: 'Edge: Various Label Types',
      data: {
        items: [
          { label: '', content: 'Empty label' },
          { label: 999999, content: 'Large number' },
          { label: '!@#', content: 'Special chars: <>&"\'{' },
          { label: '🎨', content: 'Emoji label with VeryLongContentWithoutSpaces' },
        ],
      },
    },
    pyramid: {
      type: 'pyramid',
      title: 'Edge: Length Variations',
      data: {
        items: [
          '',
          'VeryLongItemTextWithoutAnySpacesOrBreaksToTestTheWrappingBehavior',
          'Short',
          '!@#$%^&*()_+-=[]{}|;:",.<>?/~` special characters 🎨🎭🎪',
        ],
      },
    },
  };

  return layoutConfigs[layout] || layoutConfigs.title;
}

/**
 * Normal text variants - current default behavior
 */
function generateNormalTextData(layout: LayoutType): Record<string, unknown> {
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
            label: 2020,
            content:
              'Project initiated with stakeholder alignment, requirements gathering, and initial planning activities.',
          },
          {
            label: 2021,
            content:
              'Iterative development and testing cycles with continuous feedback and quality assurance.',
          },
          {
            label: 2022,
            content:
              'Official launch and deployment, including monitoring, user onboarding, and stabilization.',
          },
          {
            label: 2023,
            content:
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
