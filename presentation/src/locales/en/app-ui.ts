export default {
  // ===============================
  // CORE APPLICATION
  // ===============================
  app: {
    title: 'PPTist',
    subtitle: 'Online Presentation Tool',
    initializing: 'Initializing data, please wait...',
  },

  loading: {
    generatingPresentation: 'Generating presentation, please wait...',
  },

  // ===============================
  // EDITOR
  // ===============================
  editor: {
    templatePreview: {
      title: 'Template Preview Mode',
      subtitle: 'Choose your preferred layout. Editing will unlock after you confirm your template choice.',
      confirmCurrent: 'Confirm & Start Editing',
      confirmAll: 'Confirm All Slides',
      confirmAllWarning: 'Click Again to Confirm All',
      successSingle: 'Template confirmed! You can now edit your slide.',
      successMultiple: 'Confirmed {count} slide{plural}! All slides are now editable.',
    },
    remarks: {
      title: 'Slide Remarks',
      clickToEdit: 'Click to edit notes',
      clickToAdd: 'Click to add notes',
    },
  },

  // ===============================
  // USER INTERFACE
  // ===============================
  ui: {
    // Common Components
    components: {
      colorPicker: {
        recentlyUsed: 'Recently Used:',
        eyedropperInitializationFailed: 'Eyedropper initialization failed',
      },
      select: {
        search: 'Search',
      },
      contextmenu: {
        paste: 'Paste',
      },
    },

    // Common Actions
    actions: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
      selectAll: 'Select All',
      search: 'Search',
      preview: 'Preview',
      close: 'Close',
      back: 'Back',
      more: 'More',
      hide: 'Hide',
      show: 'Show All',
      set: 'Set',
      apply: 'Apply',
      reset: 'Reset',
      remove: 'Remove',
    },

    // Input & Forms
    inputs: {
      enterHyperlink: 'Enter Hyperlink',
      enterWebAddress: 'Enter webpage link address',
      searchFont: 'Search Font',
      searchFontSize: '',
      placeholder: 'Placeholder',
      invalidWebLink: 'Not a valid web link address',
    },

    // Layout & Navigation
    layout: {
      ruler: 'Ruler',
      gridLines: 'Grid Lines',
      none: 'None',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      fitToScreen: 'Fit to Screen',
    },

    // Mobile Interface
    mobile: {
      player: {
        exitPlay: 'Exit Play',
      },
      preview: {
        edit: 'Edit',
        play: 'Play',
      },
    },
  },
};
