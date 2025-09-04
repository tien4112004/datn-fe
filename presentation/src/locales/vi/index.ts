// Import all modular locale files
import appUi from './app-ui';
import header from './header';
import canvas from './canvas';
import toolbar from './toolbar';
import panels from './panels';
import ai from './ai';
import templatesContext from './templates-context';
import hotkeys from './hotkeys';
import notesThumbnails from './notes-thumbnails';
import elements from './elements';
import stylingElements from './styling-elements';
import stylingPosition from './styling-position';
import stylingSlide from './styling-slide';
import presentation from './presentation';
import content from './content';
import files from './files';
import system from './system';
import thumbnailDemo from './thumbnail-demo';

// Combine all locale modules
export default {
  ...appUi,
  ...header,
  ...canvas,
  ...toolbar,
  ...panels,
  ...ai,
  ...templatesContext,
  ...hotkeys,
  ...notesThumbnails,
  ...elements,
  styling: {
    ...stylingElements,
    ...stylingPosition,
    ...stylingSlide,
  },
  ...presentation,
  ...content,
  ...files,
  ...system,
  ...thumbnailDemo,
};
