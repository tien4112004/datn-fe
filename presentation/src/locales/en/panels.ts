export default {
  // Side Panels
  panels: {
    // Selection Panel
    select: {
      title: 'Select ({active}/{total})',
      showAll: 'Show All',
      hideAll: 'Hide All',
      groupTitle: 'Group',
      emptyState: 'No content on this page',
    },

    // Search & Replace
    search: {
      find: 'Find',
      replace: 'Replace',
      replaceAll: 'Replace All',
      ignoreCase: 'Ignore case',
      previous: 'Previous',
      next: 'Next',
      search: 'Search',
    },

    // Notes Panel
    notes: {
      title: 'Notes for Slide {slide}',
      reply: 'Reply',
      delete: 'Delete',
      replyPlaceholder: 'Enter reply content',
      noNotes: 'No notes for this page',
      notePlaceholder: 'Enter note (for {target})',
      selectedElement: 'selected element',
      currentSlide: 'current slide',
      clearTooltip: 'Clear all notes for this page',
      addNote: 'Add Note',
      testUser: 'Test User',
    },

    // Markup Panel
    markup: {
      title: 'Slide Type Annotation',
      currentPageType: 'Current Page Type:',
      currentTextType: 'Current Text Type:',
      currentImageType: 'Current Image Type:',
      placeholder: 'Select image, text, or shape with text to mark type',
      unmarkedType: 'Unmarked Type',
      layoutTypes: {
        title: 'Title',
        list: 'List',
        labeledList: 'Labeled List',
        twoColumn: 'Two Column',
        twoColumnWithImage: 'Two Column with Image',
        mainImage: 'Main Image',
        tableOfContents: 'Table of Contents',
        timeline: 'Timeline',
        pyramid: 'Pyramid',
      },
      textTypes: {
        title: 'Title',
        subtitle: 'Subtitle',
        content: 'Content',
        listItem: 'List Item',
        listItemTitle: 'List Item Title',
        notes: 'Notes',
        header: 'Header',
        footer: 'Footer',
        sectionNumber: 'Section Number',
        itemNumber: 'Item Number',
      },
      imageTypes: {
        pageIllustration: 'Page Illustration',
        itemIllustration: 'Item Illustration',
        backgroundImage: 'Background Image',
      },
    },

    // Image Library Panel
    imageLibrary: {
      title: 'Image Library (from pexels.com)',
      searchPlaceholder: 'Search images',
      loading: 'Loading...',
      insert: 'Insert',
      orientations: {
        all: 'All',
        landscape: 'Landscape',
        portrait: 'Portrait',
        square: 'Square',
      },
      defaultSearch: 'landscape',
      errorNoQuery: 'Please enter search keywords',
    },
  },
};
