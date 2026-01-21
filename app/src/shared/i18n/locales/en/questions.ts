/**
 * Question Bank Translations (English)
 */
export default {
  title: 'Question Bank',

  // Question Form Dialog
  form: {
    createTitle: 'Create New Question',
    editTitle: 'Edit Question',
    metadataSection: 'Question Metadata',
    contentSection: 'Question Content',
    questionType: 'Question Type',
    subject: 'Subject',
    difficulty: 'Difficulty',
    grade: 'Grade',
    selectGradeOptional: 'Select grade (optional)',
    validationErrors: 'Validation Errors',
    cancel: 'Cancel',
    create: 'Create Question',
    save: 'Save Changes',

    // Toast messages
    createSuccess: 'Question created successfully',
    updateSuccess: 'Question updated successfully',
    createError: 'Failed to create question',
    updateError: 'Failed to update question',
    missingData: 'Question data is missing',
    fixErrors: 'Please fix validation errors before saving',
  },

  // Question Bank Editor Page
  editor: {
    breadcrumb: 'Question Bank',
    createTitle: 'Create New Question',
    editTitle: 'Edit Question',
    cancel: 'Cancel',
    save: 'Save Changes',
    saving: 'Saving...',
    loading: 'Loading question...',
    preview: 'Preview',
    edit: 'Edit',
    metadataSection: 'Question Metadata',
    contentSection: 'Question Content',
    questionType: 'Question Type',
    subject: 'Subject',
    difficulty: 'Difficulty',
    grade: 'Grade',
    validationErrors: 'Validation Errors',

    // Toast messages
    createSuccess: 'Question created successfully',
    updateSuccess: 'Question updated successfully',
    createError: 'Failed to create question',
    updateError: 'Failed to update question',
    missingData: 'Question data is missing',
    fixErrors: 'Please fix validation errors before saving',
  },

  types: {
    multipleChoice: 'Multiple Choice',
    matching: 'Matching',
    openEnded: 'Open Ended',
    fillInBlank: 'Fill in the Blank',
    group: 'Group Question',
  },

  typeLabels: {
    multipleChoice: 'Multiple Choice Question',
    matching: 'Matching Question',
    openEnded: 'Open-ended Question',
    fillInBlank: 'Fill In Blank Question',
    group: 'Group Question',
  },

  difficulty: {
    knowledge: 'Knowledge',
    comprehension: 'Comprehension',
    application: 'Application',
    advancedApplication: 'Advanced Application',
  },

  bankType: {
    personal: 'Personal',
    public: 'Public',
  },

  common: {
    points: 'Points',
    totalPoints: 'Total Points',
    score: 'Score',
    explanation: 'Explanation',
    yourAnswer: 'Your Answer',
    correctAnswer: 'Correct Answer',
    expectedAnswer: 'Expected Answer',
    submitted: 'Submitted',
    noAnswer: 'No answer provided',
    characterRemaining: '{{count}} character remaining',
    characterRemaining_plural: '{{count}} characters remaining',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    scoreDisplay: 'Score: {{score}}/{{total}} points',
    pointsAbbreviation: 'pt',
    pointsAbbreviation_plural: 'pts',
    markdownPlaceholder: 'Enter text here... (Markdown supported)',
  },

  validation: {
    titleRequired: 'Title is required',
    optionTextRequired: 'Option text is required',
    minOptions: 'At least 2 options required',
    maxOptions: 'Maximum 6 options allowed',
    exactlyOneCorrect: 'Exactly one option must be marked as correct',
    leftItemRequired: 'Left item is required',
    rightItemRequired: 'Right item is required',
    minPairs: 'At least 2 pairs required',
    maxPairs: 'Maximum 8 pairs allowed',
    maxLengthExceeded: 'Maximum length exceeded',
    minSegments: 'At least one segment required',
    subQuestionTitleRequired: 'Sub-question title is required',
    minSubQuestions: 'At least one sub-question required',
  },

  // Multiple Choice
  multipleChoice: {
    editing: {
      title: 'Question Title',
      titlePlaceholder: 'Enter the question...',
      options: 'Options',
      optionPlaceholder: 'Option {{letter}}',
      addOption: 'Add Option',
      removeOption: 'Remove',
      correctAnswer: 'Mark as correct answer',
      shuffleOptions: 'Shuffle options',
      imageUrl: 'Image URL (Optional)',
      questionImage: 'Question Image',
      optionImage: 'Option Image',
      explanation: 'Explanation (Optional)',
      explanationPlaceholder: 'Add an explanation for the correct answer...',
      removeImage: 'Remove image',
      addImage: 'Add image',
    },
    viewing: {
      options: 'Options:',
      shuffle: 'Shuffle',
      explanation: 'Explanation:',
      points: 'Points: {{points}}',
    },
    doing: {
      selectAnswer: 'Select your answer',
    },
    afterAssessment: {
      yourSelection: 'Your selection',
      correctOption: 'Correct option',
    },
    grading: {
      autoGraded: 'This question is auto-graded',
      pointsEarned: 'Points Earned',
      studentAnswer: 'Student Answer:',
      studentAnswerTag: "(Student's answer)",
      autoCalculatedScore: 'Auto-calculated Score: ',
      correctScore: 'Correct - {{score}} points',
      incorrectScore: 'Incorrect - 0 points',
      grading: 'Grading',
      pointsAwarded: 'Points Awarded',
      maxPoints: 'Max: {{points}} points',
      teacherFeedback: 'Teacher Feedback (Optional)',
      feedbackPlaceholder: 'Add comments or feedback for the student...',
    },
  },

  // Matching
  matching: {
    editing: {
      title: 'Question Title',
      titlePlaceholder: 'Enter the question...',
      pairs: 'Matching Pairs',
      columnA: 'Column A (Items)',
      columnB: 'Column B (Targets)',
      leftPlaceholder: 'Left item {{number}}',
      rightPlaceholder: 'Right match {{number}}',
      addPair: 'Add Pair',
      removePair: 'Remove',
      shufflePairs: 'Shuffle pairs',
      imageUrl: 'Image URL (Optional)',
      explanation: 'Explanation (Optional)',
    },
    viewing: {
      matchingPairs: 'Matching Pairs:',
      shuffle: 'Shuffle',
      columnA: 'Column A',
      columnB: 'Column B',
      explanation: 'Explanation:',
      points: 'Points: {{points}}',
    },
    doing: {
      instruction: 'Drag items from Column A to match with Column B',
      columnA: 'Column A - Items',
      columnB: 'Column B - Targets',
      columnADrag: 'Column A (Drag from here)',
      columnBDrop: 'Column B (Drop here)',
      dropHere: 'Drop item here',
    },
    afterAssessment: {
      yourMatches: 'Your Matches',
      correctMatch: 'Correct Match',
      noMatch: 'No match',
      scoreSummary: 'Score: {{score}}/{{total}} matches correct',
    },
    grading: {
      partialCredit: 'Partial credit based on correct matches',
      correctMatches: '{{correct}} out of {{total}} correct',
      studentAnswer: 'Student Answer:',
      correctLabel: 'Correct: ',
      correctPairs: 'Correct Pairs:',
      autoCalculatedScore: 'Auto-calculated Score: ',
      correctMatchesScore: '{{correct}}/{{total}} correct matches - {{score}} points',
      grading: 'Grading',
      pointsAwarded: 'Points Awarded',
      maxPoints: 'Max: {{points}} points',
      teacherFeedback: 'Teacher Feedback (Optional)',
      feedbackPlaceholder: 'Add comments or feedback for the student...',
    },
  },

  // Open Ended
  openEnded: {
    editing: {
      title: 'Question Title',
      titlePlaceholder: 'Enter the question...',
      expectedAnswer: 'Expected Answer (Optional)',
      expectedAnswerPlaceholder: 'Provide a model answer for grading reference...',
      maxLength: 'Maximum Length',
      maxLengthPlaceholder: 'Leave blank for no limit',
      characters: 'characters',
      imageUrl: 'Image URL (Optional)',
      explanation: 'Explanation (Optional)',
    },
    viewing: {
      maxLength: 'Maximum length: {{maxLength}} characters',
      explanation: 'Explanation:',
      points: 'Points: {{points}}',
    },
    doing: {
      placeholder: 'Type your answer here...',
      characterCount: '{{current}} / {{max}} characters',
    },
    afterAssessment: {
      manualGradingNote: 'Note: Open-ended questions require manual grading by the instructor.',
      awaitingGrade: 'Awaiting manual grade',
      pendingGrading: 'Pending Grading',
    },
    grading: {
      title: 'Open-ended Question - Grading',
      studentAnswer: 'Student Answer:',
      noAnswer: 'No answer provided',
      characterCount: 'Character count: {{count}}{{max}}',
      expectedAnswerReference: 'Expected Answer (Reference):',
      gradingRequired: 'Grading (Required for Open-ended Questions)',
      pointsAwarded: 'Points Awarded',
      enterPoints: 'Enter points...',
      maxPoints: 'Max: {{points}} points',
      teacherFeedback: 'Teacher Feedback',
      feedbackPlaceholder: "Provide detailed feedback on the student's answer...",
      feedbackHint: 'Please provide constructive feedback for the student.',
      gradingTips: 'Grading Tips:',
      tip1: 'Consider completeness, accuracy, and clarity of the answer',
      tip2: 'Compare with the expected answer if provided',
      tip3: 'Provide specific, actionable feedback',
      tip4: 'Highlight both strengths and areas for improvement',
    },
  },

  // Fill in Blank
  fillInBlank: {
    editing: {
      title: 'Question Title',
      titlePlaceholder: 'Enter question title (optional)',
      questionImage: 'Question Image',
      questionText: 'Question Text',
      questionTextPlaceholder: 'Use {{answer}} to mark blanks. Example: I {{am}} a {{student}}.',
      questionTextInstruction: 'Use {{answer}} to create blanks in the text.',
      questionTextExample: 'Example: "I {{am}} a {{student}}." will create 2 blanks.',
      preview: 'Preview',
      previewBlank: 'blank',
      alternativeAnswers: 'Alternative Answers',
      blankLabel: 'Blank {{index}}:',
      addAlternative: 'Add Alternative',
      alternativePlaceholder: 'Alternative answer',
      explanation: 'Explanation',
      explanationPlaceholder: 'Explain the answer (optional, shown after assessment)',
      sentence: 'Sentence with Blanks',
      blankPlaceholder: 'Blank {{number}}',
      addBlank: 'Add Blank',
      caseSensitive: 'Case Sensitive',
      imageUrl: 'Image URL (Optional)',
      correctAnswer: 'Correct answer',
      acceptableAnswers: 'Alternative acceptable answers',
      alternativeAnswersHint: 'Alternatives are parsed from your question text using :: syntax',
      alternativesSyntax: 'Use :: to separate alternatives: {{answer1::alternative2::alternative3}}',
      noAlternatives: 'No alternative answers',
    },
    viewing: {
      expectedAnswers: 'Expected Answers:',
      blankLabel: 'Blank {{index}}',
      caseSensitiveWarning: '⚠️ Answers are case-sensitive',
      explanation: 'Explanation:',
      points: 'Points: {{points}}',
    },
    doing: {
      blankPlaceholder: 'Blank {{number}}',
      caseSensitiveWarning: '⚠️ Answers are case-sensitive',
    },
    afterAssessment: {
      yourAnswers: 'Your Answers',
      correctAnswers: 'Correct Answers',
      empty: '(empty)',
      scoreSummary: 'Score: {{score}}/{{total}} blanks correct',
    },
    grading: {
      partialCredit: 'Partial credit based on correct blanks',
      correctBlanks: '{{correct}} out of {{total}} correct',
      studentAnswer: 'Student Answer:',
      blankByBlankReview: 'Blank-by-Blank Review:',
      blankNumber: 'Blank {{number}}',
      studentLabel: 'Student: ',
      correctLabel: 'Correct: ',
      alsoAcceptable: 'Also acceptable: ',
      caseSensitiveInfo: '⚠️ This question is case-sensitive',
      autoCalculatedScore: 'Auto-calculated Score: ',
      correctBlanksScore: '{{correct}}/{{total}} correct blanks - {{score}} points',
      grading: 'Grading',
      pointsAwarded: 'Points Awarded',
      maxPoints: 'Max: {{points}} points',
      teacherFeedback: 'Teacher Feedback (Optional)',
      feedbackPlaceholder: 'Add comments or feedback for the student...',
    },
  },

  group: {
    title: 'Group Question',
    description: 'Create a question group containing multiple sub-questions',

    // Editing mode
    editing: {
      groupDescription: 'Group Description',
      groupDescriptionPlaceholder: 'Enter a description, passage, or context for this group of questions...',
      groupDescriptionHint: 'Provide context or instructions for all sub-questions',
      titleImage: 'Title Image (Optional)',

      displaySettings: 'Display Settings',
      showNumbers: 'Show question numbers',
      shuffleQuestions: 'Shuffle questions',
      totalPoints: 'Total Points',

      addQuestion: 'Add Question',
      selectType: 'Select question type:',
      subQuestions: 'Sub-Questions',

      validationWarning: 'A group question must contain at least one sub-question.',

      types: {
        multipleChoice: 'Multiple Choice',
        multipleChoiceDesc: 'Single correct answer',
        matching: 'Matching',
        matchingDesc: 'Match pairs',
        openEnded: 'Open Ended',
        openEndedDesc: 'Free text answer',
        fillInBlank: 'Fill in Blank',
        fillInBlankDesc: 'Complete sentence',
      },
    },

    // Viewing mode
    viewing: {
      preview: 'Preview',
    },

    // Doing mode
    doing: {
      progress: 'Progress',
      answered: '{{count}} of {{total}} answered',
    },

    // After Assessment mode
    afterAssessment: {
      results: 'Results',
      yourScore: 'Your Score',
    },

    // Grading mode
    grading: {
      overallGrade: 'Overall Grade',
      totalPointsEarned: 'Total Points Earned',
      overallFeedback: 'Overall Feedback (Optional)',
      feedbackPlaceholder: 'Add feedback for the student...',
    },

    // Sub-question wrapper
    subQuestion: {
      questionNumber: 'Question {{number}}',
      points: '{{points}} pts',
      progress: 'Progress:',
      questionsAnswered: ' questions answered',
      emptyStateTitle: 'No questions in this group yet.',
      emptyStateMessage: 'Click "Add Question" to get started.',
    },
  },
};
