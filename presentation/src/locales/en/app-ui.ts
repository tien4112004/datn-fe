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
      confirmCurrent: 'Confirm & Start Editing',
      confirmAll: 'Confirm All Slides',
      confirmAllWarning: 'Click Again to Confirm All',
      successSingle: 'Template confirmed! You can now edit your slide.',
      successMultiple: 'Confirmed {count} slide{plural}! All slides are now editable.',
      infoButton: 'Learn more about this mode',
      dialog: {
        title: 'Understanding Template Preview Mode',
        intro:
          'You are currently in Template Preview Mode. This mode lets you explore and choose layouts before editing.',
        currentMode: 'Current Mode',
        canDo: 'What You Can Do',
        cannotDo: 'What You Cannot Do',
        available: 'Available Features',
        howToUnlock: 'To unlock full editing capabilities, confirm your template choice:',
        previewMode: {
          title: 'Template Preview Mode',
          features: {
            browseTemplates: 'Browse and preview different slide layouts',
            switchLayouts: 'Switch between template variations',
            navigateSlides: 'Navigate through your presentation',
            previewContent: 'See how your content looks in different layouts',
          },
          limitations: {
            editText: 'Edit or modify text content',
            moveElements: 'Move, resize, or rearrange elements',
            addContent: 'Add new text boxes, shapes, or images',
            customizeStyles: 'Change colors, fonts, or styling',
            deleteContent: 'Delete or remove existing content',
            slideModification: 'Modify slide using AI',
          },
        },
        editingMode: {
          title: 'Normal Editing Mode',
          features: {
            fullEditing: 'Edit all text and content freely',
            moveResize: 'Move and resize any element',
            addElements: 'Add text, shapes, images, and more',
            customizeDesign: 'Customize colors, fonts, and styles',
            slideEditing: 'Modify slide structure, add/remove slides',
            elementEditing: 'Edit individual elements with full control',
            aiEditing: 'Use AI to refine content, generate images, and improve layouts',
            fullToolbar: 'Access all editing tools and features',
            deleteModify: 'Delete, duplicate, or modify anything',
          },
        },
      },
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
