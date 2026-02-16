export default {
  demo: {
    title: 'Assignment Demo',
    subtitle: 'Test question types and modes',
    controls: {
      title: 'Controls',
      subtitle: 'Configure demo settings',
      demoMode: {
        label: 'Demo Mode',
        single: 'Single Question',
        collection: 'Question Collection',
      },
      viewMode: {
        label: 'View Mode',
      },
      questionType: {
        label: 'Question Type',
      },
      submit: 'Submit Answer (Demo)',
    },
  },
  navigation: {
    title: 'Navigation',
    progress: 'Progress',
    answered: 'answered',
    previous: 'Prev',
    next: 'Next',
    questionLabel: 'Question {{number}}',
    questionAnswered: 'Question {{number}} (answered)',
  },
  collection: {
    title: 'Question Collection',
    management: {
      title: 'Question Management',
      addQuestion: {
        label: 'Add New Question',
        button: 'Add Question',
      },
      loadMockData: {
        button: 'Load Mock Data',
        confirmTitle: 'Load Mock Data',
        confirmDescription:
          'This will replace all current questions with mock data. Any unsaved changes will be lost. Are you sure you want to continue?',
        cancel: 'Cancel',
        confirm: 'Load Mock Data',
      },
      questionCount: '{{count}} question',
      questionCount_plural: '{{count}} questions',
      noQuestions: 'No questions in collection',
      addFirstQuestion: 'Use the sidebar to add questions',
    },
    item: {
      questionNumber: 'Q{{number}}',
      collapse: 'Collapse question',
      expand: 'Expand question',
      delete: 'Delete question',
      dragToReorder: 'Drag to reorder',
      deleteConfirm: {
        title: 'Delete Question',
        description: 'Are you sure you want to delete this question? This action cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Delete',
      },
      dataMissingTitle: 'Question {{number}} - Data Missing (Debug)',
      dataMissingFieldId: 'Field ID: {{id}}',
      removeQuestionConfirm: 'Remove this {{type}} question?',
      noQuestionText: 'No question text',
      topicLabel: 'Topic *',
      difficultyLabel: 'Difficulty',
      pointsLabel: 'Points *',
      selectTopicPlaceholder: 'Select topic',
      noTopic: 'None',
      pointsShort: '{{points}} pts',
    },
  },
  viewModes: {
    editing: 'Editing',
    viewing: 'Viewing',
    doing: 'Doing',
    afterAssessment: 'After Assessment',
    grading: 'Grading',
  },
  questionTypes: {
    multipleChoice: 'Multiple Choice',
    matching: 'Matching',
    openEnded: 'Open-ended',
    fillInBlank: 'Fill In Blank',
  },
  difficulty: {
    nhanBiet: 'Knowledge',
    thongHieu: 'Comprehension',
    vanDung: 'Application',
    vanDungCao: 'Advanced Application',
  },
  debug: {
    questionJson: 'Debug: Question JSON',
    collectionJson: 'Debug: Collection JSON',
  },
  questionBank: {
    title: 'Question Bank',
    subtitle: 'Browse and select questions',
    bankTypes: {
      personal: 'Personal Bank',
      application: 'Application Bank',
    },
    filters: {
      search: 'Search questions...',
      type: 'Question Type',
      difficulty: 'Difficulty',
      subject: 'Subject',
      grade: 'Grade',
      chapter: 'Chapter',
      clearFilters: 'Clear Filters',
      allTypes: 'All Types',
      allDifficulties: 'All Difficulties',
      allSubjects: 'All Subjects',
      noChapters: 'No chapters',
    },
    selection: {
      selected: '{{count}} selected',
      addSelected: 'Add Selected ({{count}})',
      copySelected: 'Copy Selected ({{count}})',
      copyToPersonal: 'Copy {{count}} to Personal Bank',
      copying: 'Copying...',
      cancel: 'Cancel',
    },
    copyToPersonal: {
      success: '{{count}} question(s) copied to your personal bank',
      error: 'Failed to copy questions',
    },
    empty: {
      title: 'No questions found',
      description: 'Try adjusting your filters or search terms',
    },
    card: {
      points: 'Points: {{points}}',
      selected: 'Selected',
      applicationBadge: 'Read-Only',
      untitled: 'Untitled Question',
      hasContext: 'Has reading passage',
    },
    subjects: {
      toan: 'Math',
      tiengViet: 'Vietnamese',
      tiengAnh: 'English',
    },
  },
  shared: {
    imageUploader: {
      label: 'Image',
      uploadButton: 'Upload Image',
      uploading: 'Uploading...',
      preview: 'Preview',
      uploadError: 'Failed to upload image',
      chooseFromStorage: 'Choose from My Storage',
    },
    imageStorageDialog: {
      title: 'Choose Image from My Storage',
      description: 'Select an image from your previously uploaded images',
      searchPlaceholder: 'Search images...',
      noImages: 'No images found',
      imageAlt: 'Storage image',
      loadMore: 'Load More',
      loadingMore: 'Loading...',
      cancel: 'Cancel',
      select: 'Select Image',
    },
  },
  editing: {
    shuffle: {
      shuffleOptions: 'Shuffle Options',
      shuffleOptionsDescription: 'Randomize the order of options for each student',
      shufflePairs: 'Shuffle Pairs',
      shufflePairsDescription: 'Randomize the order of matching pairs for each student',
      shuffleQuestions: 'Shuffle Questions',
      shuffleQuestionsDescription: 'Randomize the order of questions for each student',
    },
    multipleChoice: {
      title: 'Edit Multiple Choice Question',
      alerts: {
        minOptions: 'Must have at least 2 options',
      },
      labels: {
        question: 'Question',
        questionImage: 'Question Image (optional)',
        options: 'Options',
        explanation: 'Explanation (shown after assessment)',
      },
      placeholders: {
        question: 'Enter your question here...',
        option: 'Enter option text...',
        explanation: 'Explain the correct answer...',
      },
      buttons: {
        addOption: 'Add Option',
        removeImage: 'Remove image',
        addImage: 'Add image',
      },
    },
    matching: {
      title: 'Edit Matching Question',
      alerts: {
        minPairs: 'Must have at least 2 pairs',
      },
      labels: {
        question: 'Question',
        questionImage: 'Question Image (optional)',
        matchingPairs: 'Matching Pairs',
        left: 'Left',
        right: 'Right',
        explanation: 'Explanation (shown after assessment)',
      },
      placeholders: {
        question: 'Enter your matching question instructions...',
        leftItem: 'Left item...',
        rightItem: 'Right item...',
        explanation: 'Explain the correct matches...',
      },
      buttons: {
        addPair: 'Add Pair',
        addImage: 'Add image',
        removeImage: 'Remove image',
      },
      pair: 'Pair {{number}}',
    },
    openEnded: {
      title: 'Edit Open-ended Question',
      labels: {
        question: 'Question',
        questionImage: 'Question Image (optional)',
        maxLength: 'Max Answer Length',
        expectedAnswer: 'Expected Answer (optional)',
        explanation: 'Explanation (shown after assessment)',
      },
      placeholders: {
        question: 'Enter your question here...',
        expectedAnswer: 'Enter a sample/expected answer for reference...',
        explanation: 'Explain what makes a good answer...',
      },
      maxLengthInfo: '{{length}} chars (0 = unlimited)',
    },
    fillInBlank: {
      title: 'Edit Fill In Blank Question',
      alerts: {
        minSegments: 'Must have at least 1 segment',
      },
      labels: {
        title: 'Title (optional)',
        caseSensitive: 'Case sensitive',
        titleImage: 'Title Image (optional)',
        questionSegments: 'Question Segments',
        alternativeAnswers: 'Alternative answers',
        preview: 'Preview:',
        explanation: 'Explanation (shown after assessment)',
      },
      placeholders: {
        title: 'Enter a title or instructions...',
        text: 'Enter text...',
        correctAnswer: 'Correct answer...',
        alternative: 'Alternative...',
        explanation: 'Explain the correct answers...',
      },
      buttons: {
        addText: 'Add Text',
        addBlank: 'Add Blank',
        add: 'Add',
      },
      segmentTypes: {
        text: 'Text',
        blank: 'Blank',
      },
    },
  },
  assignmentEditor: {
    // Page titles
    pageTitle: {
      create: 'Create New Assignment',
      edit: 'Edit Assignment',
    },

    // Main action buttons
    actions: {
      actions: 'Actions',
      cancel: 'Cancel',
      save: 'Save Assignment',
      fillMatrixGaps: 'Generate Question from Matrix Gap',
      saving: 'Saving...',
      tooltips: {
        save: 'Save changes',
        generate: 'Generate questions using AI',
        generateMatrix: 'Generate assessment matrix using AI',
        fromBank: 'Add from question bank',
        addContext: 'Create a new reading passage',
        fromLibrary: 'Import from context library',
        fillMatrixGaps: 'Detect gaps in the matrix and generate questions to fill them',
      },
    },

    // Loading state
    loading: 'Loading assignment...',

    // Form validation messages
    validation: {
      titleRequired: 'Title is required',
      subjectRequired: 'Subject is required',
      topicNameRequired: 'Topic name is required',
      invalidQuestions: 'Some questions are missing required fields',
      questionsHaveErrors: '{{count}} question(s) have validation errors',
      assignmentFieldsRequired: 'Please fill in the required assignment fields',
      multipleErrors: 'Please fix {{count}} question(s) with errors and fill in required fields',
      matrixNotFulfilled: '{{count}} matrix cell(s) do not have enough questions',
    },

    // Toast notifications
    toasts: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      saveError: 'Failed to save assignment',
      noTopicError: 'Please add at least one topic before adding questions from the bank',
      questionsAdded: '{{count}} question(s) added to the assignment',
      contextFetchError: 'Failed to fetch reading passages for imported questions',

      // Submission-related
      submitSuccess: 'Assignment submitted successfully!',
      submitError: 'Failed to submit assignment: {{message}}',
      gradingSaved: 'Grading saved successfully!',
      gradingError: 'Failed to save grading: {{message}}',
      submissionDeleted: 'Submission deleted successfully!',
      submissionDeleteError: 'Failed to delete submission: {{message}}',
    },

    // Questions panel and toolbar
    questions: {
      panelTitle: 'Questions',
      title: 'Questions',
      stats: '{{count}} question ({{points}} points total)',
      stats_plural: '{{count}} questions ({{points}} points total)',
      addFromBank: 'Add from Bank',
      toolbar: {
        addQuestion: 'Add Question',
        generate: 'Generate',
        fromBank: 'From Bank',
        previewMode: 'Preview Mode',
        editMode: 'Edit Mode',
        tooltips: {
          addQuestion: 'Create a new question',
          generate: 'Generate questions using AI',
          fromBank: 'Import questions from question bank',
          switchToEdit: 'Switch all to edit mode',
          switchToPreview: 'Switch all to preview mode',
        },
      },
      emptyState: {
        noQuestions: 'No questions yet',
        hint: 'Click "Add Question" to get started',
        title: 'No questions added yet',
        description: 'Start building your assignment by adding questions from the question bank',
      },
    },

    // Assignment metadata panel
    metadata: {
      panelTitle: 'Assignment Info',
      edit: 'Edit',
      title: 'Assignment Metadata',
      fields: {
        title: 'Title',
        subject: 'Subject',
        grade: 'Grade',
        class: 'Class',
        description: 'Description',
        dueDate: 'Due Date',
        shuffleQuestions: 'Shuffle Questions',
        shuffleQuestionsEnabled: 'Enabled',
        shuffleQuestionsDisabled: 'Disabled',
        emptyValue: '-',
        titlePlaceholder: 'Enter assignment title',
        subjectPlaceholder: 'Select subject',
        gradePlaceholder: 'Select grade',
        classPlaceholder: 'Select a class',
        descriptionPlaceholder: 'Enter assignment description (optional)',
        dueDatePlaceholder: 'Select due date',
      },
      tooltips: {
        title: 'Name your assignment',
        subject: 'Choose subject area',
        grade: 'Select grade level',
        description: 'Add optional instructions',
        shuffleQuestions: 'Randomize question order per student',
      },
    },

    // Metadata edit dialog
    metadataDialog: {
      title: 'Edit Assignment Details',
      description:
        'Update the assignment metadata. Changes are saved automatically when you close this dialog.',
      fields: {
        title: 'Title',
        subject: 'Subject',
        grade: 'Grade',
        description: 'Description',
        shuffleQuestions: 'Shuffle questions for each student',
      },
      placeholders: {
        title: 'Enter assignment title',
        subject: 'Select a subject',
        grade: 'e.g., 1, 2, 3...',
        description: 'Optional assignment description',
      },
      done: 'Done',
    },

    // Assessment matrix panel
    matrix: {
      panelTitle: 'Assessment Matrix',
      view: 'View',
      edit: 'Edit',
      emptyState: {
        message: 'No assessment matrix configured',
        create: 'Create',
      },
      preview: {
        topics: '{{count}} topic',
        topics_plural: '{{count}} topics',
        questions: '{{count}} question',
        questions_plural: '{{count}} questions',
        required: 'Required: {{count}}',
      },
    },

    // Matrix editor dialog
    matrixEditor: {
      title: 'Edit Assessment Matrix',
      description:
        'Configure topics and required question counts for each difficulty level. Changes are saved automatically.',
      topicsLabel: 'Topics',
      addTopic: 'Add Topic',
      editTopic: 'Edit Topic',
      editTopicDescription: 'Update the topic name and description',
      topicName: 'Topic Name',
      topicDescription: 'Topic Description',
      topicPlaceholder: 'Topic name...',
      descriptionPlaceholder: 'Topic description (optional)...',
      addChapter: 'Add Chapter',
      parentTopic: 'Topic Group',
      parentTopicPlaceholder: 'Topic group name...',
      editGroup: 'Edit Topic Group',
      editGroupDescription: 'Rename the topic group. All chapters in this group will be updated.',
      groupName: 'Group Name',
      groupNamePlaceholder: 'Topic group name...',
      deleteTopic: 'Delete Topic',
      emptyMessage: 'Add topics to see the matrix',
      done: 'Done',
      cancel: 'Cancel',
      save: 'Save',
      tableHeaders: {
        topic: 'Topic',
      },
      useContextLabel: 'Use reading passages',
      useContextHint:
        'When enabled, AI will use reading passages when generating questions for this topic through Fill Matrix Gaps',
      useContextDescription: 'This setting is used when generating questions with Fill Matrix Gaps',
      usesContext: 'Uses reading passages',
    },

    // Contexts panel
    contextsPanel: {
      panelTitle: 'Reading Passages',
      description: 'Create and manage reading passages that can be shared across questions.',
      addContext: 'Add Reading Passage',
      emptyState: 'No reading passages yet. Create one to attach to questions.',
      titleField: 'Title',
      contentField: 'Content',
      authorField: 'Author (optional)',
      create: 'Create',
      cancel: 'Cancel',
      deleteConfirmTitle: 'Delete Reading Passage',
      deleteConfirmDescription: 'Are you sure you want to delete "{{title}}"?',
      deleteConfirmWarning:
        'This passage is referenced by {{count}} question(s). Deleting it will unlink those questions.',
      delete: 'Delete',
      fromLibrary: 'From Library',
      fromLibraryTitle: 'Import from Library',
      fromLibraryDescription: 'Browse reading passages from the library and add them to this assignment.',
      searchLibrary: 'Search library...',
      loadingLibrary: 'Loading...',
      noLibraryContextFound: 'No reading passages found in library',
      import: 'Import',
      importSelected: 'Import Selected ({{count}})',
      alreadyAdded: 'Already added',
    },

    // Import context dialog (shown when importing questions with bound contexts from bank)
    importContextDialog: {
      title: 'Import Reading Passages',
      description:
        'Some of the selected questions reference reading passages that are not yet in this assignment. These passages will be added automatically.',
      passageCount: '{{count}} passage(s) will be added:',
      dontAskAgain: "Don't ask again",
      cancel: 'Cancel',
      import: 'Import',
    },

    // Matrix builder panel
    matrixBuilder: {
      panelTitle: 'Assessment Matrix Builder',
      description:
        'Configure topics and required question counts for each difficulty level. Changes are saved automatically.',
      generateMatrix: 'Generate Matrix',
      tooltips: {
        addTopic: 'Add new topic',
        addChapter: 'Add a chapter to this group',
        editGroup: 'Rename topic group',
        editTopic: 'Edit topic details',
        cellInput: 'Required question count',
        removeCell: 'Remove cell',
        addCell: 'Add question requirement',
      },
    },

    // Generate matrix dialog
    generateMatrixDialog: {
      title: 'Generate Assessment Matrix with AI',
      description: 'Use AI to automatically generate an assessment matrix based on your specifications.',
      presets: {
        label: 'Quick Start',
        quickQuiz: {
          label: 'Quick Quiz',
          description: '10 questions, basic difficulty, multiple choice only',
        },
        standardTest: {
          label: 'Standard Test',
          description: '20 questions, all difficulties, no open-ended',
        },
        comprehensiveExam: {
          label: 'Comprehensive Exam',
          description: '40 questions, all difficulties, all types',
        },
      },
      fields: {
        name: 'Matrix Name',
        namePlaceholder: 'Enter matrix name',
        nameHelp: 'A unique name to identify this matrix',
        grade: 'Grade',
        gradePlaceholder: 'Select grade',
        gradeHelp: 'Grade level affects suggested difficulty levels and question types',
        subject: 'Subject',
        subjectPlaceholder: 'Select subject',
        subjectHelp: 'Filter questions by subject to create a relevant matrix',
        totalQuestions: 'Total Questions',
        totalQuestionsHelp: 'The total number of questions you want in the matrix',
        totalPoints: 'Total Points',
        totalPointsHelp: 'Total points across all questions',
        difficulties: 'Difficulty Levels',
        difficultiesHelp:
          'KNOWLEDGE: Recall information. COMPREHENSION: Explain ideas. APPLICATION: Use ideas',
        questionTypes: 'Question Types',
        questionTypesHelp:
          'MULTIPLE_CHOICE: Pick one answer. FILL_IN_BLANK: Fill in missing text. MATCHING: Match pairs. OPEN_ENDED: Written response',
        prompt: 'Prompt',
        promptPlaceholder: 'Describe what you want the matrix to focus on...',
        promptHelp: 'Example: "Focus on chapters 1-3", "Emphasize practical applications"',
        language: 'Language',
        languageVietnamese: 'Tiếng Việt',
        languageEnglish: 'English',
        languageHelp: 'Language to use for generated topics',
        model: 'AI Model',
        modelPlaceholder: 'Select AI model',
        modelHelp: 'Different models have different speed and accuracy tradeoffs',
      },
      actions: {
        cancel: 'Cancel',
        generate: 'Generate Matrix',
        generating: 'Generating...',
      },
      toast: {
        success: 'Matrix generated successfully',
        error: 'Failed to generate matrix',
        noQuestionTypes: 'Please select at least one question type',
        noDifficulties: 'Please select at least one difficulty level',
      },
      validation: {
        nameRequired: 'Matrix name is required',
        gradeRequired: 'Grade is required',
        subjectRequired: 'Subject is required',
        totalQuestionsRequired: 'Total questions must be at least 1',
        totalPointsRequired: 'Total points must be at least 1',
      },
      confirmation: {
        title: 'Matrix Generated Successfully',
        description: 'How would you like to apply the generated matrix?',
        summary: '{{topicCount}} topics, {{totalQuestions}} questions, {{totalPoints}} points',
        replaceWarning:
          'Warning: Replace mode will remove {{count}} existing question(s) assigned to current topics.',
        replace: 'Replace',
        merge: 'Merge',
        cancel: 'Cancel',
      },
      savePreset: {
        title: 'Save as Preset',
        description: 'Save current configuration for reuse later',
        fields: {
          name: 'Preset Name',
          namePlaceholder: 'Enter preset name (max 50 characters)',
          description: 'Description',
          descriptionPlaceholder: 'Brief description of this preset (optional)',
          icon: 'Icon',
        },
        errors: {
          nameRequired: 'Preset name is required',
          nameTooLong: 'Preset name must not exceed 50 characters',
        },
        save: 'Save Preset',
      },
    },

    fillMatrixGaps: {
      title: 'Generate Question from Matrix Gap',
      detecting: 'Detecting gaps...',
      noGaps: 'No gaps found! Matrix is complete.',
      gapsFound: 'Found {{count}} gap(s) requiring {{total}} questions',
      selectGaps: 'Select which gaps to fill',
      generatingQuestions: 'Generating questions for {{count}} gap(s)...',
      success: 'Successfully filled {{count}} gap(s)',
      status: {
        allRequirementsMet: 'All matrix requirements have been met',
      },
      gapDetails: {
        title: 'Gap Details',
        topic: 'Topic',
        difficulty: 'Difficulty',
        type: 'Question Type',
        needed: 'Need {{count}} more questions',
        available: '{{available}} / {{required}}',
        selected: 'Selected',
        select: 'Select',
      },
      errors: {
        noMatrix: 'No matrix exists. Please create a matrix first.',
        noRequirements: 'Matrix has no requirements. Please add requirements to the matrix.',
        noGapsSelected: 'Please select at least one gap to fill',
        modelRequired: 'Please select an AI model before generating questions',
        detectionFailed: 'Failed to detect gaps',
        generationFailed: 'Failed to generate questions',
        missingMetadata: 'Please set the grade and subject before generating questions from matrix gaps.',
      },
      actions: {
        selectAll: 'Select All',
        clearAll: 'Clear All',
        backToMatrix: 'Back to Matrix',
        backToReview: 'Back to Review',
        generateQuestions: 'Generate Questions',
        fillMatrixGaps: 'Generate Question from Matrix Gap',
      },
      fields: {
        model: 'AI Model',
        modelPlaceholder: 'Select AI model',
        additionalPrompt: 'Additional Prompt',
        additionalPromptPlaceholder: 'E.g., Focus on practical applications',
        promptHint: 'Provide additional context to guide question generation',
      },
      tooltips: {
        fillMatrixGaps: 'Detect gaps in the matrix and generate questions to fill them',
      },
    },

    // Matrix view dialog
    matrixView: {
      title: 'Assessment Matrix',
      description: 'View the complete assessment matrix showing required vs current question counts.',
      summary: {
        topics: '{{count}} topic',
        topics_plural: '{{count}} topics',
        questions: '{{count}} question',
        questions_plural: '{{count}} questions',
      },
      legend: {
        valid: 'Valid',
        warning: 'Warning',
        empty: 'Empty',
      },
      tableHeaders: {
        topic: 'Topic',
        total: 'Total',
      },
      close: 'Close',
    },

    // Assignment basic info
    basicInfo: {
      title: 'Assignment Info',
      titleLabel: 'Title',
      titlePlaceholder: 'Enter assignment title...',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Select subject',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe the assignment...',
    },

    // Question count indicator
    questionCountIndicator: {
      noQuestions: 'No questions yet',
      count: '{{count}} Question',
      count_plural: '{{count}} Questions',
    },

    // View mode toggle
    viewModeToggle: {
      preview: 'Preview',
      edit: 'Edit',
    },

    // Question Navigator
    navigator: {
      questionsCount: '{{count}} Question',
      questionsCount_plural: '{{count}} Questions',
      listView: 'List View',
      assignmentInfo: 'Assignment Info',
      matrixBuilder: 'Matrix Builder',
      contexts: 'Reading Passages',
      untitled: 'Untitled',
      tooltips: {
        assignmentInfo: 'Edit assignment details',
        matrixBuilder: 'Configure assessment matrix',
        contexts: 'Manage reading passages',
        questionNumber: 'Click to edit, drag to reorder',
      },
    },

    // Question List Dialog
    questionList: {
      title: 'All Questions',
      emptyMessage: 'No questions added yet',
      dragHint: 'Drag questions to reorder them',
      questionNumber: 'Q{{number}}',
      close: 'Close',
    },

    // Matrix cell
    matrixCell: {
      required: 'Required:',
      ok: 'OK',
      needMore: 'Need {{count}} more',
      extra: '{{count}} extra',
    },

    // Current question view
    currentQuestion: {
      panelTitle: 'Question {{number}}',
      dataMissing: 'Question data missing',
      questionOf: 'Question {{current}} of {{total}}',
      edit: 'Edit',
      preview: 'Preview',
      noQuestions: 'No questions yet',
      addQuestionHint: 'Click "Add Question" to get started',
      noQuestionSelected: 'No question selected',
      selectQuestionHint: 'Select a question from the navigator to edit',
    },

    // Questions list
    questionsList: {
      emptyTitle: 'No questions yet',
      emptyHint: 'Click "Add Question" to get started',
    },

    // Question navigator
    questionNavigator: {
      questionCount: '{{count}} Question',
      questionCount_plural: '{{count}} Questions',
      assignmentInfo: 'Assignment Info',
      untitled: 'Untitled',
    },

    // Question content preview
    questionPreview: {
      multipleChoice: '{{count}} options • Correct: {{correct}}',
      matching: '{{count}} pair',
      matching_plural: '{{count}} pairs',
      fillInBlank: '{{count}} blank',
      fillInBlank_plural: '{{count}} blanks',
      openEnded: {
        withLimit: 'Free response ({{limit}} chars)',
        unlimited: 'Free response (unlimited)',
      },
      placeholderWarning: 'Has placeholder or empty content',
      noAnswerWarning: 'No expected answer provided',
    },
  },

  generatedQuestions: {
    title: 'Generated Questions',
    subtitle: 'Review and manage your AI-generated questions',
    summary: 'Successfully generated {{count}} question(s)',
    promptLabel: 'Prompt',
    noQuestions: 'No generated questions to display',
    backToQuestionBank: 'Back to Question Bank',
    generateMore: 'Generate More',
    toast: {
      deleteSuccess: 'Question(s) deleted successfully',
      deleteError: 'Failed to delete question(s)',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      deleteSelected: 'Delete Selected',
    },
    dialogs: {
      delete: {
        description: 'Are you sure you want to delete {{count}} question(s)? This action cannot be undone.',
      },
    },
    selectedCount: '{{count}} question(s) selected',
  },

  teacherQuestionBank: {
    title: 'My Question Bank',
    subtitle: 'Manage your personal question library',

    actions: {
      create: 'Create Question',
      import: 'Import CSV',
      export: 'Export CSV',
      generate: 'Generate with AI',
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      deleteSelected: 'Delete Selected',
      copyToPersonal: 'Copy to Personal',
      browsePublic: 'Browse Public Questions',
    },

    generate: {
      title: 'Generate Questions with AI',
      description: 'Use AI to automatically generate questions based on your specifications.',
      fields: {
        prompt: 'Prompt',
        promptPlaceholder: 'Describe what questions to generate (e.g., "Addition and subtraction within 20")',
        promptHelp: 'Be specific about what content the questions should cover',
        grade: 'Grade Level',
        gradePlaceholder: 'Select grade',
        subject: 'Subject',
        subjectPlaceholder: 'Select subject',
        chapter: 'Chapter',
        chapterPlaceholder: 'Select chapter (optional)',
        chapterHelp: 'The generated questions will be more relevant if you specify the chapter',
        questionTypes: 'Question Types',
        questionTypesHelp: 'Select at least one question type to generate',
        questionsPerDifficulty: 'Questions per Difficulty',
        difficultyKnowledge: 'Knowledge',
        difficultyComprehension: 'Comprehension',
        difficultyApplication: 'Application',
        model: 'AI Model',
        modelPlaceholder: 'Select model (optional)',
        total: 'Total:',
        questionSingular: 'question',
        questionPlural: 'questions',
        largeGenerationWarning: 'Large generation may take longer',
      },
      tooltips: {
        prompt: 'Describe the topic, chapter, or specific content you want questions about',
        chapter: 'Narrow down questions to a specific chapter in the curriculum',
        questionTypes: 'Choose which question formats to generate',
        questionsPerDifficulty: 'Set how many questions to generate for each difficulty level',
        model: 'Choose which AI model to use for generation',
      },
      questionTypes: {
        MULTIPLE_CHOICE: 'Multiple Choice',
        MATCHING: 'Matching',
        FILL_IN_BLANK: 'Fill in Blank',
        OPEN_ENDED: 'Open Ended',
      },
      actions: {
        cancel: 'Cancel',
        generate: 'Generate Questions',
        generating: 'Generating...',
      },
      toast: {
        success: 'Successfully generated {{count}} question(s)',
        error: 'Failed to generate questions',
        noQuestionTypes: 'Please select at least one question type',
        noQuestionsRequested: 'Please specify at least one question to generate',
      },
      validation: {
        promptRequired: 'Prompt is required',
        gradeRequired: 'Grade is required',
        subjectRequired: 'Subject is required',
        questionTypesRequired: 'At least one question type is required',
        questionsRequired: 'At least one question must be requested',
      },
      footer: {
        readyToGenerate: 'Ready to generate:',
        questionSingular: 'question',
        questionPlural: 'questions',
        typeSingular: 'type',
        typePlural: 'types',
        validationRequired: 'Please fill in all required fields before generating',
      },
    },

    filters: {
      bankType: 'Bank Type',
      all: 'All Questions',
      personalOnly: 'Personal Only',
      applicationOnly: 'Application Only',
      clearFilters: 'Clear Filters',
    },

    table: {
      columns: {
        title: 'Title',
        content: 'Content',
        questionType: 'Question Type',
        subject: 'Subject',
        grade: 'Grade',
        difficulty: 'Difficulty',
        points: 'Points',
      },
      noQuestions: 'No questions found',
      loading: 'Loading questions...',
    },

    empty: {
      noQuestions: {
        title: 'No Questions Yet',
        description: 'Create your first question or import from CSV to get started.',
      },
      noResults: {
        title: 'No Questions Found',
        description: 'Try adjusting your filters or search query.',
      },
      noPersonal: {
        message:
          "You don't have any personal questions yet. Copy questions from the application bank or create new ones.",
      },
    },

    dialogs: {
      copyToPersonal: {
        title: 'Copy to Personal Bank',
        description:
          'This will create a copy of this question in your personal bank. You can then edit it freely.',
        confirm: 'Copy Question',
        cancel: 'Cancel',
      },
      delete: {
        title: 'Delete Question(s)',
        description: 'Are you sure you want to delete {{count}} question(s)? This action cannot be undone.',
        confirm: 'Delete',
        cancel: 'Cancel',
      },
    },

    toast: {
      createSuccess: 'Question created successfully',
      createError: 'Failed to create question',
      updateSuccess: 'Question updated successfully',
      updateError: 'Failed to update question',
      deleteSuccess: 'Question(s) deleted successfully',
      deleteError: 'Failed to delete question(s)',
      duplicateSuccess: 'Question duplicated successfully',
      duplicateError: 'Failed to duplicate question',
      copySuccess: 'Question copied to personal bank',
      copyError: 'Failed to copy question',
      exportSuccess: 'Questions exported successfully',
      exportError: 'Failed to export questions',
      importSuccess: 'Questions imported successfully',
      importError: 'Failed to import questions',
    },

    pagination: {
      showing: 'Showing {{from}} to {{to}} of {{total}} questions',
      previous: 'Previous',
      next: 'Next',
    },
  },

  questionBankView: {
    pageTitle: 'Question Details',
    sections: {
      metadata: 'Question Information',
      content: 'Question Content',
      explanation: 'Explanation',
      context: 'Reading Passage',
    },
    fields: {
      title: 'Title',
      subject: 'Subject',
      grade: 'Grade',
      type: 'Question Type',
      difficulty: 'Difficulty',
      chapter: 'Chapter',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
    },
    actions: {
      title: 'Actions',
      edit: 'Edit Question',
      duplicate: 'Duplicate Question',
      delete: 'Delete Question',
    },
    toast: {
      deleteSuccess: 'Question deleted successfully',
      deleteError: 'Failed to delete question',
      duplicateSuccess: 'Question duplicated successfully',
      duplicateError: 'Failed to duplicate question',
    },
    deleteDialog: {
      title: 'Delete Question?',
      description: 'This action cannot be undone. This will permanently delete this question.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },

  dialogs: {
    copyToPersonal: {
      title: 'Copy to Personal Bank',
      description: 'This will create a copy of this question in your personal bank.',
      questionToCopy: 'Question to copy:',
      message:
        'The copied question will be added to your personal bank and can be edited or deleted as needed.',
      cancel: 'Cancel',
      copying: 'Copying...',
      copyQuestion: 'Copy Question',
    },
    importQuestions: {
      title: 'Import Questions from CSV',
      description: 'Upload a CSV file containing questions to import into your personal question bank.',
      downloadTemplate: 'Download CSV Template',
      uploadPlaceholder: 'Click to upload or drag and drop',
      fileTypeInfo: 'CSV files only',
      successMessage: 'Successfully imported {{count}} question(s)',
      errorMessage: 'Import completed with errors: {{success}} succeeded, {{failed}} failed',
      errorDetails: 'Error Details:',
      moreErrors: '... and {{count}} more errors',
      formatRequirements: 'CSV Format Requirements:',
      requirement1: 'First row must contain headers: type, title, difficulty, subject, points, content',
      requirement2: 'type must be one of: multipleChoice, matching, openEnded, fillInBlank',
      requirement3: 'difficulty must be one of: nhanBiet, thongHieu, vanDung, vanDungCao',
      requirement4: 'subject must be one of: toan, tiengViet, tiengAnh',
      requirement5: 'content must be valid JSON for the question type',
      close: 'Close',
      cancel: 'Cancel',
      importing: 'Importing...',
      importQuestions: 'Import Questions',
    },
    questionForm: {
      titleCreate: 'Create New Question',
      titleEdit: 'Edit Question',
      metadataSection: 'Question Metadata',
      contentSection: 'Question Content',
      validationErrors: 'Validation Errors',
      labels: {
        questionType: 'Question Type',
        subject: 'Subject',
        difficulty: 'Difficulty',
        points: 'Points',
      },
      questionTypes: {
        multipleChoice: 'Multiple Choice',
        matching: 'Matching',
        openEnded: 'Open-ended',
        fillInBlank: 'Fill In Blank',
      },
      subjects: {
        math: 'Math',
        vietnamese: 'Vietnamese',
        english: 'English',
      },
      difficulties: {
        nhanBiet: 'Nhận biết',
        thongHieu: 'Thông hiểu',
        vanDung: 'Vận dụng',
        vanDungCao: 'Vận dụng cao',
      },
      buttons: {
        cancel: 'Cancel',
        create: 'Create Question',
        save: 'Save Changes',
      },
      errors: {
        missingData: 'Question data is missing',
        validationFailed: 'Please fix validation errors before saving',
      },
    },
    unsavedChanges: {
      title: 'Unsaved Changes',
      description: 'You have unsaved changes. Are you sure you want to leave?',
      stay: 'Stay',
      leave: 'Leave',
    },
    deleteAssignment: {
      title: 'Delete Assignment?',
      description: 'This action cannot be undone. This will permanently delete the assignment.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },

  preview: {
    optionsCorrect: 'options • Correct:',
    placeholderContent: 'Has placeholder or empty content',
    pairs: 'pairs',
    blanks: 'blank(s)',
    freeResponse: 'Free response ({{limit}})',
    noExpectedAnswer: 'No expected answer provided',
  },

  common: {
    unsavedChanges: 'Unsaved changes',
  },

  viewer: {
    metadata: {
      panelTitle: 'Assignment Information',
      fields: {
        title: 'Title',
        subject: 'Subject',
        grade: 'Grade',
        description: 'Description',
        shuffleQuestions: 'Shuffle Questions',
        createdAt: 'Created At',
      },
    },
    questions: {
      panelTitle: 'Question {{number}}',
      topic: 'Topic',
      difficulty: 'Difficulty',
      points: 'Points',
      noQuestions: 'No Questions',
      noQuestionsDescription: 'This assignment has no questions yet.',
      noQuestionSelected: 'No Question Selected',
      selectQuestion: 'Select a question to view',
    },
    matrix: {
      panelTitle: 'Assessment Matrix',
      viewDescription: 'This matrix shows the distribution of questions by topic and difficulty level.',
    },
    navigator: {
      questionsCount: 'Questions ({{count}})',
      listView: 'List View',
      assignmentInfo: 'Assignment Info',
      matrixBuilder: 'Assessment Matrix',
      contexts: 'Reading Passages',
    },
    actions: {
      title: 'Actions',
      edit: 'Edit Assignment',
      viewQuestionsList: 'View Questions List',
      delete: 'Delete Assignment',
    },
  },

  view: {
    pageTitle: 'View Assignment',
    notFound: 'Assignment not found',
    notFoundDescription: 'The assignment you are looking for does not exist or has been deleted.',
    noDescription: 'No description provided',
    noQuestions: 'No questions',
    noQuestionsDescription: 'This assignment has no questions yet.',
    noMatrix: 'No assessment matrix',
    noMatrixDescription: 'This assignment has no assessment matrix configured.',
    deleteSuccess: 'Assignment deleted successfully',
    deleteError: 'Failed to delete assignment',

    tabs: {
      overview: 'Overview',
      questions: 'Questions',
    },

    status: {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
    },

    metadata: {
      totalQuestions: '{{count}} question',
      totalQuestions_plural: '{{count}} questions',
      totalPoints: '{{points}} points',
      createdAt: 'Created {{date}}',
    },

    actions: {
      edit: 'Edit',
      delete: 'Delete',
    },

    deleteDialog: {
      title: 'Delete Assignment?',
      description:
        'This action cannot be undone. This will permanently delete the assignment and all its questions.',
      cancel: 'Cancel',
      delete: 'Delete',
    },

    overview: {
      totalQuestions: 'Total Questions',
      totalPoints: 'Total Points',
      status: 'Status',
      description: 'Description',
      questionsByType: 'Questions by Type',
      questionsByDifficulty: 'Questions by Difficulty',
    },

    questions: {
      title: '{{count}} Question',
      title_plural: '{{count}} Questions',
      totalPoints: '{{points}} points total',
      questionNumber: 'Question {{number}}',
      points: '{{points}} pts',
    },
  },

  context: {
    readingPassage: 'Reading Passage',
    collapse: 'Collapse',
    expand: 'Expand',
    edit: 'Edit',
    preview: 'Preview',
    selectContext: 'Select reading passage...',
    searchContext: 'Search reading passages...',
    loading: 'Loading...',
    noContextFound: 'No reading passages found',
    contextLabel: 'Reading Passage',
    noContext: 'None',
    questionInGroup: 'Question {{current}} of {{total}} (Q{{number}})',
    points: 'pts',
    questionsCount: '{{count}} questions',
    contextGroupEditTip: 'Click individual question numbers in the navigator to edit them separately.',
    titlePlaceholder: 'Enter reading passage title...',
    contentPlaceholder: 'Enter reading passage content...',
    authorPlaceholder: 'Author (optional)',
    done: 'Done',
    disconnect: 'Disconnect reading passage',
    assignmentOnlyHint: 'Changes only apply to this assignment.',
  },

  submissions: {
    // Status badges
    status: {
      graded: 'Graded',
      submitted: 'Submitted',
      inProgress: 'In Progress',
      pending: 'Pending',
    },

    // Common actions
    actions: {
      back: 'Back',
      goBack: 'Go Back',
      viewResult: 'View Result',
      newAttempt: 'New Attempt',
      startAssignment: 'Start Assignment',
      submit: 'Submit',
      submitting: 'Submitting...',
      grade: 'Grade',
      view: 'View',
      save: 'Save Grading',
      saving: 'Saving...',
      cancel: 'Cancel',
      previous: 'Previous',
      next: 'Next',
    },

    // Student submissions page
    studentSubmissions: {
      notFound: 'Assignment not found',
      previewMode: 'Preview mode: Access through class homework to view submissions',
      due: 'Due:',
      points: 'points',
      totalSubmissions: 'Total Submissions',
      max: 'Max:',
      bestScore: 'Best Score',
      latestStatus: 'Latest Status',
      score: 'Score:',
      previewModeButton: 'Preview Mode',
      maxSubmissionsReached: 'Max Submissions Reached',
      attemptsUsed: 'attempts used',
      submissionHistory: 'Submission History',
      noSubmissions: 'No submissions yet',
      startFirstAttempt: 'Start your first attempt to complete this assignment',
      accessThroughHomework: 'Access through class homework to submit',
      attempt: 'Attempt #{{number}}',
      latest: 'Latest',
      submitted: 'Submitted',
      graded: 'Graded',
      submission: 'submission',
      submission_plural: 'submissions',
      best: 'Best:',
    },

    // Assignment submissions page (teacher view)
    assignmentSubmissions: {
      title: 'Submissions',
      notFound: 'Assignment not found',
      totalSubmissions: 'Total Submissions',
      graded: 'Graded',
      pendingReview: 'Pending Review',
      averageScore: 'Average Score',
      notAvailable: 'N/A',
      waitingForReview: 'waiting for review',
      noSubmissions: 'No submissions yet',
      studentsHaventSubmitted: "Students haven't submitted their work yet",
      tableHeaders: {
        student: 'Student',
        submitted: 'Submitted',
        status: 'Status',
        score: 'Score',
        actions: 'Actions',
      },
      unknownStudent: 'Unknown Student',
      notGraded: 'Not graded',
      previewMode: 'Preview mode: Access through a specific homework post to see submissions',
    },

    // Submission result page (student view)
    result: {
      notFound: 'Submission not found',
      yourGradedSubmission: 'Your Graded Submission',
      notGraded: 'Not graded',
      excellent: 'Excellent!',
      greatJob: 'Great job!',
      goodWork: 'Good work!',
      keepPracticing: 'Keep practicing!',
      questions: 'Questions',
      totalPoints: 'Total Points',
      submitted: 'Submitted',
      graded: 'Graded',
      gradedBy: 'Graded by',
      question: 'Question',
      points: 'points',
      youEarned: 'You earned:',
      teacherFeedback: 'Teacher Feedback',
      overallFeedback: 'Overall Feedback from Teacher',
    },

    // Assignment doing page (student doing assignment)
    doing: {
      notFound: 'Assignment not found',
      of: 'of',
      complete: '% complete',
      due: 'Due:',
      points: 'points',
      progress: 'Progress',
      answered: 'answered',
      question: 'Question',
      questions: 'Questions',
      questionAnswered: 'Question {{number}} (Answered)',
      answerAllQuestions: 'Please answer all questions before submitting',
      cannotSubmit: 'Cannot submit: This assignment must be accessed through class homework',
      someQuestionsUnanswered: 'Some questions are not answered',
      reviewBeforeSubmit: 'Please review and answer all questions before submitting.',
      submitDialog: {
        title: 'Submit Assignment?',
        description:
          "Are you sure you want to submit this assignment? You won't be able to change your answers after submission.",
        totalQuestions: 'Total Questions:',
        answered: 'Answered:',
        totalPoints: 'Total Points:',
        previewMode: 'Preview mode: Access through class homework to submit',
      },
    },

    // Teacher grading page
    grading: {
      title: 'Grade Submission',
      notFound: 'Submission not found',
      graded: 'graded',
      submitted: 'Submitted',
      gradingProgress: 'Grading Progress',
      currentScore: 'Current Score',
      overallFeedback: 'Overall Feedback (Optional)',
      feedbackDescription: "Provide general comments about the student's work",
      overallFeedbackPlaceholder: 'Great work! You demonstrated a good understanding...',
      gradeAllQuestions: 'Grade all questions before saving',
      pleaseGradeAll: 'Please grade all questions ({{count}} remaining)',
      question: 'Question',
      worth: 'Worth',
      points: 'points',
      grading: 'Grading',
      pointsAwarded: 'Points Awarded',
      outOf: 'out of',
      feedbackForQuestion: 'Feedback for this question (Optional)',
      questionFeedbackPlaceholder: 'Add specific feedback about this answer...',
    },
  },
};
