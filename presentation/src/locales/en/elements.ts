export default {
  // Elements & Content
  elements: {
    // Element Types
    types: {
      text: 'Text',
      image: 'Image',
      shape: 'Shape',
      line: 'Line',
      chart: 'Chart',
      table: 'Table',
      video: 'Video',
      audio: 'Audio',
      formula: 'Formula',
    },

    // Text Elements
    text: {
      editor: {
        // Rich Text Controls
        textColor: 'Text Color',
        textHighlight: 'Text Highlight',
        increaseFontSize: 'Increase Font Size',
        decreaseFontSize: 'Decrease Font Size',
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        superscript: 'Superscript',
        subscript: 'Subscript',
        inlineCode: 'Inline Code',
        blockquote: 'Blockquote',
        clearFormatting: 'Clear Formatting',
        formatPainter: 'Format Painter (Double-click for continuous use)',

        // Links
        enterHyperlink: 'Enter Hyperlink',
        hyperlink: 'Hyperlink',
        remove: 'Remove',
        confirm: 'Confirm',
        invalidWebLink: 'Not a valid web link address',

        // Fonts
        searchFont: 'Search Font',
        searchFontSize: 'Search Font Size',

        // Alignment
        alignLeft: 'Align Left',
        alignCenter: 'Align Center',
        alignRight: 'Align Right',
        justify: 'Justify',

        // Lists
        bulletList: 'Bullet List',
        numberedList: 'Numbered List',

        // Indentation
        decreaseIndent: 'Decrease Indent',
        reduceFirstLineIndent: 'Reduce First Line Indent',
        increaseFirstLineIndent: 'Increase First Line Indent',
        increaseIndent: 'Increase Indent',
      },

      prosemirror: {
        fontLoadingWait: 'Font needs to wait for loading and downloading to take effect, please wait',
      },
    },

    // Table Elements
    table: {
      interaction: {
        doubleClickToEdit: 'Double-click to edit',
      },

      // Column Operations
      columns: {
        insertColumn: 'Insert column',
        toTheLeft: 'To the left',
        toTheRight: 'To the right',
        deleteColumn: 'Delete column',
        selectCurrentColumn: 'Select current column',
      },

      // Row Operations
      rows: {
        insertRow: 'Insert row',
        above: 'Above',
        below: 'Below',
        deleteRow: 'Delete row',
        selectCurrentRow: 'Select current row',
      },

      // Cell Operations
      cells: {
        mergeCells: 'Merge cells',
        unmergeCells: 'Unmerge cells',
        selectAllCells: 'Select all cells',
      },
    },

    // Media Elements
    media: {
      // Audio
      audio: {
        audioLoadingFailed: 'Audio loading failed',
      },

      // Video
      video: {
        videoFailedToLoad: 'Video failed to load',
        speed: 'Speed',
        on: 'On',
        off: 'Off',
      },

      // Thumbnails
      thumbnails: {
        loading: 'Loading ...',
      },
    },

    // Chart Elements
    charts: {
      dataEditor: {
        confirm: 'Confirm',
        clickToChange: 'Click to Change',
        cancel: 'Cancel',
        clearData: 'Clear Data',
        yAxis: 'Y',
      },
    },

    // LaTeX Elements
    latex: {
      editor: {
        commonSymbols: 'Common Symbols',
        cancel: 'Cancel',
        confirm: 'Confirm',
        formulaCannotBeEmpty: 'Formula cannot be empty',
        formulaPreview: 'Formula Preview',
        presetFormulas: 'Preset Formulas',
        placeholder: 'Enter LaTeX formula',
      },
    },

    // Outline Editor
    outline: {
      hierarchy: {
        theme: 'Theme',
        chapter: 'Chapter',
        section: 'Section',
      },

      actions: {
        // Chapter Actions
        addSubOutlineChapter: 'Add Sub Outline (Chapter)',
        addSameLevelAboveChapter: 'Add Same Level Above (Chapter)',
        deleteThisChapter: 'Delete This Chapter',

        // Section Actions
        addSubOutlineSection: 'Add Sub Outline (Section)',
        addSameLevelAboveSection: 'Add Same Level Above (Section)',
        deleteThisSection: 'Delete This Section',

        // Item Actions
        addSubOutlineItem: 'Add Sub Outline (Item)',
        addSameLevelAboveItem: 'Add Same Level Above (Item)',
        addSameLevelBelowItem: 'Add Same Level Below (Item)',
        deleteThisItem: 'Delete This Item',
      },

      defaults: {
        newChapter: 'New Chapter',
        newSection: 'New Section',
        newItem: 'New Item',
      },
    },
  },
};
