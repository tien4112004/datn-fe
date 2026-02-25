export default {
  questionBank: {
    title: 'Application Question Bank',
    subtitle: 'Manage shared questions for all teachers',
    selectedCount: '{{count}} question(s) selected',

    actions: {
      create: 'Create Question',
      import: 'Import',
      export: 'Export',
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      deleteSelected: 'Delete Selected',
    },

    table: {
      columns: {
        title: 'Title',
        type: 'Type',
        subject: 'Subject',
        difficulty: 'Difficulty',
        created: 'Created',
      },
      noTitle: 'No title',
      loading: 'Loading questions...',
      empty: 'No questions found. Create your first question to get started.',
    },

    pagination: {
      showing: 'Showing {{from}} to {{to}} of {{total}} questions',
      page: 'Page {{current}} of {{total}}',
      previous: 'Previous',
      next: 'Next',
    },

    confirm: {
      bulkDelete: 'Are you sure you want to delete {{count}} question(s)?',
      delete: 'Are you sure you want to delete this question?',
    },

    toast: {
      deleteSuccess: 'Questions deleted successfully',
      deleteError: 'Failed to delete questions',
      duplicateSuccess: 'Question duplicated successfully',
      duplicateError: 'Failed to duplicate question',
      exportSuccess: 'Export started',
      exportError: 'Failed to export questions',
    },

    dialogs: {
      import: {
        title: 'Import Questions from CSV',
        description: 'Upload a CSV file containing questions to import into the application question bank.',
        downloadTemplate: 'Download CSV Template',
        uploadText: 'Click to upload or drag and drop',
        uploadHint: 'CSV files only',
        formatTitle: 'CSV Format Requirements:',
        formatRules: {
          headers: 'First row must contain column headers',
          required: 'Required fields: title, type, difficulty, subject',
          typeSpecific: 'Type-specific fields vary (options for multiple choice, pairs for matching, etc.)',
          templateHint: 'Use "Download Template" button to get examples for each question type',
        },
        successMessage: 'Successfully imported {{count}} question(s)',
        errorMessage: 'Import completed with errors: {{success}} succeeded, {{failed}} failed',
        errorDetails: 'Error Details:',
        moreErrors: '... and {{count}} more errors',
        cancel: 'Cancel',
        close: 'Close',
        importing: 'Importing...',
        importButton: 'Import Questions',
      },
      export: {
        title: 'Export Questions',
        description: '{{count}} question(s) available. Review and select the ones you want to export.',
        selectedCount: '{{selected}} of {{total}} selected',
        cancel: 'Cancel',
        exportButton: 'Export {{count}} Question(s)',
      },
    },
  },
} as const;
