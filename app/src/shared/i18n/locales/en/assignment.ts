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
      clearFilters: 'Clear Filters',
      allTypes: 'All Types',
      allDifficulties: 'All Difficulties',
      allSubjects: 'All Subjects',
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
  },
  assignmentEditor: {
    title: 'Assignment Editor',
    createNew: 'Create New Assignment',
    editAssignment: 'Edit Assignment',

    metadata: {
      title: 'Assignment Details',
      fields: {
        title: 'Title',
        titlePlaceholder: 'Enter assignment title...',
        class: 'Class',
        classPlaceholder: 'Select a class',
        description: 'Description',
        descriptionPlaceholder: 'Add instructions or context for this assignment...',
        dueDate: 'Due Date',
        dueDatePlaceholder: 'Pick a due date',
      },
    },

    questions: {
      title: 'Questions',
      addFromBank: 'Add from Question Bank',
      emptyState: {
        title: 'No questions yet',
        description: 'Add questions from the question bank to get started',
      },
      stats: '{{count}} question • {{points}} points total',
      stats_plural: '{{count}} questions • {{points}} points total',
    },

    actions: {
      saveDraft: 'Save Draft',
      publish: 'Publish',
      cancel: 'Cancel',
      delete: 'Delete Assignment',
    },

    validation: {
      titleRequired: 'Assignment title is required',
      classRequired: 'Please select a class',
      noQuestions: 'Assignment must have at least one question',
      dueDateRequired: 'Due date is required for published assignments',
      dueDatePast: 'Due date must be in the future',
    },

    toast: {
      draftSaved: 'Draft saved successfully',
      published: 'Assignment published successfully',
      deleted: 'Assignment deleted successfully',
      error: 'Failed to save assignment',
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
};
