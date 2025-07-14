export default {
  // AI Features
  ai: {
    dialog: {
      title: 'AIPPT',
      templateSubtitle: 'Select a suitable template from below to start generating PPT',
      outlineSubtitle:
        'Confirm the content outline below (click to edit content, right-click to add/delete outline items), then start selecting templates',
      setupSubtitle:
        'Enter your PPT topic below and add appropriate information such as industry, position, subject, purpose, etc.',
      topicPlaceholder: 'Please enter PPT topic, e.g.: College Student Career Planning',
      generate: 'AI Generate',

      // Settings
      settings: {
        language: 'Language:',
        style: 'Style:',
        model: 'Model:',
        images: 'Images:',
      },

      // Options
      languages: {
        chinese: 'Chinese',
        english: 'English',
        japanese: 'Japanese',
      },

      styles: {
        general: 'General',
        academic: 'Academic',
        workplace: 'Workplace',
        education: 'Education',
        marketing: 'Marketing',
      },

      models: {
        glm4Flash: 'GLM-4-Flash',
        glm4FlashX: 'GLM-4-FlashX',
        doubaoLite: 'doubao-1.5-lite-32k',
        doubaoSeed: 'doubao-seed-1.6-flash',
      },

      imageOptions: {
        none: 'None',
        mockTest: 'Mock Test',
        aiSearch: 'AI Search',
        aiCreate: 'AI Create',
      },

      // Actions
      actions: {
        selectTemplate: 'Select Template',
        backToRegenerate: 'Back to Regenerate',
        backToOutline: 'Back to Outline',
      },

      // Status
      status: {
        loadingTip: 'AI is generating, please wait patiently...',
        enterTopicError: 'Please enter PPT topic first',
      },

      // Sample Topics
      sampleTopics: {
        companyAnnualMeetingPlanning: 'Company Annual Meeting Planning',
        howBigDataChangesTheWorld: 'How Big Data Changes the World',
        restaurantMarketResearch: 'Restaurant Market Research',
        aigcApplicationsInEducation: 'AIGC Applications in Education',
        how5GTechnologyChangesOurLives: 'How 5G Technology Changes Our Lives',
        collegeStudentCareerPlanning: 'College Student Career Planning',
        technologyFrontiers2025: '2025 Technology Frontiers',
        socialMediaAndBrandMarketing: 'Social Media and Brand Marketing',
        annualWorkSummaryAndOutlook: 'Annual Work Summary and Outlook',
        blockchainTechnologyAndApplications: 'Blockchain Technology and Applications',
      },
    },
  },
};
