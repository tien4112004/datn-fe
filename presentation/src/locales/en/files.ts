export default {
  // File Operations
  files: {
    // Export
    export: {
      // Common Options
      common: {
        exportRange: 'Export Range:',
        customRange: 'Custom Range: ({min} ~ {max})',
        close: 'Close',
        exporting: 'Exporting...',
        all: 'All',
        currentPage: 'Current Page',
        custom: 'Custom',
      },

      // JSON Export
      json: {
        exportJSON: 'Export JSON',
      },

      // PPTX Export
      pptx: {
        exportPPTX: 'Export PPTX',
        ignoreAudioVideo: 'Ignore Audio/Video:',
        ignoreAudioVideoTooltip: `By default, audio and video are ignored during export. If your slides contain audio or video elements and you want to include them in the exported PPTX file, you can choose to disable the 'Ignore Audio/Video' option. However, note that this will significantly increase the export time.`,
        overwriteDefaultMaster: 'Overwrite Default Master:',
        note: 'Note: 1. Supported export formats: avi, mp4, mov, wmv, mp3, wav; 2. Cross-origin resources cannot be exported.',
      },

      // PPTist Export
      pptist: {
        exportPptistFile: 'Export .pptist File',
        pptistTip:
          '.pptist is the unique file extension of this application, supporting importing files of this type back into the application.',
      },

      // Image Export
      image: {
        exportImage: 'Export Image',
        imageQuality: 'Image Quality:',
        exportFormat: 'Export Format:',
        ignoreOnlineFonts: 'Ignore Online Fonts:',
        ignoreOnlineFontsTooltip:
          "By default, online fonts are ignored during export. If you have used online fonts in your slides and wish to retain the styles after export, you can disable the 'Ignore Online Fonts' option. Note that this will increase export time.",
      },

      // PDF Export
      pdf: {
        printExportPDF: 'Print / Export PDF',
        perPageCount: 'Slides per Page:',
        edgePadding: 'Edge Padding:',
        tip: "Tip: If the print preview doesn't match the actual style, please check the [Background Graphics] option in the popup print window.",
      },
    },

    // Import
    import: {
      xAxis: 'X',
      yAxis: 'Y',
    },
  },
};
