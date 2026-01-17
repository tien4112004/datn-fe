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
      copyToPersonal: 'Copy {{count}} to Personal Bank',
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
    // Breadcrumb navigation
    breadcrumbs: {
      assignments: 'Assignments',
      createAssignment: 'Create Assignment',
      editAssignment: 'Edit Assignment',
    },

    // Main action buttons
    actions: {
      actions: 'Actions',
      cancel: 'Cancel',
      save: 'Save Assignment',
      saving: 'Saving...',
    },

    // Form validation messages
    validation: {
      titleRequired: 'Title is required',
      subjectRequired: 'Subject is required',
      topicNameRequired: 'Topic name is required',
    },

    // Toast notifications
    toasts: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      saveError: 'Failed to save assignment',
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
          generate: 'AI generation coming soon',
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
      topicPlaceholder: 'Topic name...',
      emptyMessage: 'Add topics to see the matrix',
      done: 'Done',
      tableHeaders: {
        topic: 'Topic',
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
      untitled: 'Untitled',
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
    },

    // Current question view
    currentQuestion: {
      dataMissing: 'Question data missing',
      questionOf: 'Question {{current}} of {{total}}',
      edit: 'Edit',
      preview: 'Preview',
      noQuestions: 'No questions yet',
      addQuestionHint: 'Click "Add Question" to get started',
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

  teacherQuestionBank: {
    title: 'My Question Bank',
    subtitle: 'Manage your personal question library',

    actions: {
      create: 'Create Question',
      import: 'Import CSV',
      export: 'Export CSV',
      deleteSelected: 'Delete Selected',
      copyToPersonal: 'Copy to Personal',
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
};
