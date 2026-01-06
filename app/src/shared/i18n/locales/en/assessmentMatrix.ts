export default {
  title: 'Assessment Matrix Management',
  subtitle: 'Create and manage exam specifications (Table of Specifications)',

  builder: {
    title: 'Matrix Builder',
    createTitle: 'Create Assessment Matrix',
    editTitle: 'Edit Assessment Matrix',
    tabs: {
      configuration: 'Configuration',
      preview: 'Preview',
    },

    config: {
      basicInfo: 'Basic Information',
      name: 'Matrix Name',
      namePlaceholder: 'e.g., Midterm Exam - Grade 10 Math',
      description: 'Description',
      descriptionPlaceholder: 'Optional description...',
      subject: 'Subject',
      targetPoints: 'Target Total Points',
      targetPointsDescription: 'The desired total score for this exam',
    },

    topics: {
      title: 'Topics',
      subtitle: 'Define the topics covered in this exam',
      addTopic: 'Add Topic',
      manageTopic: 'Manage Topics',
      noTopics: 'No topics added',
      addFirstTopic: 'Add topics to define matrix structure',
    },

    grid: {
      title: 'Matrix Grid',
      subtitle: 'Define question requirements for each topic × difficulty combination',
      topic: 'Topic',
      difficulty: 'Difficulty',
      clickToEdit: 'Click a cell to edit requirements',
      empty: 'Empty',
      questions: '{{count}} question',
      questions_plural: '{{count}} questions',
      points: '{{points}} pts',
    },

    cell: {
      editTitle: 'Edit Cell Requirements',
      topic: 'Topic',
      difficulty: 'Difficulty',
      questionCount: 'Number of Questions',
      questionCountPlaceholder: 'e.g., 5',
      pointsPerQuestion: 'Points Per Question',
      pointsPerQuestionPlaceholder: 'e.g., 2',
      totalPoints: 'Total Cell Points',
      clear: 'Clear Cell',
      save: 'Save',
      cancel: 'Cancel',
    },

    preview: {
      title: 'Matrix Preview',
      summary: 'Summary',
      totalTopics: 'Total Topics',
      totalCells: 'Total Cells',
      totalQuestions: 'Total Questions',
      totalPoints: 'Total Points',
      targetPoints: 'Target Points',
      difference: 'Difference',
    },

    actions: {
      save: 'Save Matrix',
      cancel: 'Cancel',
      saveAndClose: 'Save & Close',
    },
  },

  topic: {
    dialogTitle: 'Manage Topics',
    dialogSubtitle: 'Add topics to define the structure of your exam matrix',
    createTitle: 'Create New Topic',
    editTitle: 'Edit Topic',
    name: 'Topic Name',
    namePlaceholder: 'Enter topic name (e.g., Algebra, Grammar)',
    description: 'Description',
    descriptionPlaceholder: 'Enter topic description',
    subject: 'Subject',
    save: 'Save Topic',
    cancel: 'Cancel',
    delete: 'Delete Topic',
    addButton: 'Add Topic',
    addToMatrix: 'Add',
    done: 'Done',

    sections: {
      addNew: 'Add New Topic',
      current: 'Current Topics',
      currentCount: 'Current Topics ({{count}})',
      previous: 'Previously Created Topics',
      previousCount: 'Previously Created Topics ({{count}})',
      previousSubtitle: "Topics you've used in other matrices. Click to reuse.",
    },

    validation: {
      nameRequired: 'Topic name is required',
      descriptionRequired: 'Topic description is required',
      alreadyInMatrix: 'This topic is already in your matrix',
      alreadyAdded: 'Topic already added to this matrix',
    },

    emptyState: {
      noTopics: 'No topics added yet. Create your first topic above.',
    },

    deleteConfirm: {
      title: 'Delete Topic',
      description: 'Are you sure you want to delete this topic? Topics used in matrices cannot be deleted.',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
  },

  generator: {
    title: 'Generate Exam from Matrix',
    subtitle: 'Select questions matching matrix requirements to create an exam',
    cellStatus: 'Cell Requirements',
    questionBank: 'Question Bank',
    generateButton: 'Generate Exam',
    cancelButton: 'Cancel',
    success: 'Exam generated successfully',
    selectCell: 'Select a cell to filter questions',
    noActiveCell: 'Select a cell on the left to view matching questions',
    alreadyAssigned: 'Question already assigned to {{topic}} - {{difficulty}}',
  },

  cellStatus: {
    fulfilled: 'Fulfilled',
    partial: 'Partial',
    empty: 'Empty',
    questionsSelected: '{{selected}}/{{required}} questions',
    pointsSelected: '{{selected}}/{{required}} points',
    clickToFilter: 'Click to filter questions for this cell',
  },

  progress: {
    title: 'Matrix Progress',
    overall: 'Overall Progress',
    cellsCompleted: '{{completed}}/{{total}} cells completed',
    pointsProgress: '{{current}}/{{target}} points assigned',
    status: {
      valid: 'Matrix is complete and valid',
      invalid: 'Matrix has errors',
      partial: 'Matrix is partially complete',
    },
    errors: 'Errors ({{count}})',
    warnings: 'Warnings ({{count}})',
    noErrors: 'No errors',
    noWarnings: 'No warnings',
  },

  validation: {
    nameRequired: 'Matrix name is required',
    subjectRequired: 'Subject is required',
    targetPointsRequired: 'Target points is required',
    targetPointsPositive: 'Target points must be positive',
    noTopics: 'At least one topic is required',
    noCells: 'At least one cell is required',
    cellQuestionCountPositive: 'Question count must be positive',
    cellPointsPositive: 'Points per question must be positive',
  },

  messages: {
    created: 'Matrix created successfully',
    updated: 'Matrix updated successfully',
    topicCreated: 'Topic created successfully',
    topicUpdated: 'Topic updated successfully',
    topicDeleted: 'Topic deleted successfully',
    topicInUse: 'Cannot delete topic that is used in matrices',
    validated: 'Matrix validation complete',
    error: 'An error occurred. Please try again.',
  },

  subjects: {
    T: 'Math',
    TV: 'Vietnamese',
    TA: 'English',
  },

  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    nhan_biet: 'Knowledge',
    thong_hieu: 'Comprehension',
    van_dung: 'Application',
    van_dung_cao: 'Advanced Application',
  },

  status: {
    fulfilled: 'Fulfilled',
    partial: 'Partial',
    empty: 'Empty',
    perfectMatch: 'Perfect Match!',
    withinTolerance: 'Within Tolerance',
    offBy: 'Off by',
  },

  labels: {
    filteringFor: 'Filtering for:',
    questions: 'Questions',
    points: 'Points',
    totalCells: 'Total Cells',
    totalQuestions: 'Total Questions',
    totalPoints: 'Total Points',
    pointsProgress: 'Points Progress',
    ptsFromTarget: 'pts from target',
  },

  loading: {
    saving: 'Saving...',
    loading: 'Loading...',
    loadingQuestions: 'Loading questions...',
  },

  emptyStates: {
    noQuestions: 'No questions found',
    matrixNotFound: 'Matrix not found',
    addTopicsFirst: 'Add topics first to define the matrix grid',
    createFirstMatrix: 'Create your first exam matrix to get started',
  },

  buttons: {
    backToList: 'Back to Matrix List',
    done: 'Done',
  },

  breadcrumbs: {
    AssignmentMatrix: 'Assessment Matrix',
    editMatrix: 'Edit Matrix',
    createMatrix: 'Create Matrix',
  },

  toasts: {
    unassigned: 'Unassigned from {{name}}',
    cellFull: 'Cell is full ({{count}} questions required)',
    assigned: 'Assigned to {{name}}',
    cellsNotFulfilled: '{{count}} cells are not fully fulfilled',
    selectOneMatrix: 'Please select exactly one matrix',
    matrixNotFound: 'Matrix not found',
    examGenerated: 'Exam generated: {{name}}',
  },

  search: {
    placeholder: 'Search questions...',
  },

  fallbacks: {
    untitledQuestion: 'Untitled Question',
  },

  table: {
    total: 'Total',
  },
};
