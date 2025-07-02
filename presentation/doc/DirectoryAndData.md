**Project Directory & Data Structure**

### Project Directory Structure

```
├── assets                        // Static assets
│   ├── fonts                     // Web font files
│   └── styles                    // Styles
│       ├── antd.scss             // Overrides for default Ant Design styles
│       ├── font.scss             // Web font definitions
│       ├── global.scss           // Common global styles
│       ├── mixin.scss            // SCSS global mixins
│       ├── variable.scss         // SCSS global variables
│       └── prosemirror.scss      // Default styles for ProseMirror rich text editor
├── components                    // Reusable components unrelated to business logic
├── configs                       // Configuration files (e.g., canvas dimensions, fonts, animation settings, keyboard shortcuts, preset shapes, preset lines, etc.)
├── hooks                         // Shared Vue hooks used by multiple components/modules
├── mocks                         // Mock data
├── plugins                       // Custom Vue plugins
├── types                         // Type definition files
├── store                         // Pinia store (see https://pinia.vuejs.org/)
├── utils                         // General utility functions
└── views                         // Business‐specific component directory, divided into `Editor` and `Player` parts
    ├── components                // Shared business components
    ├── Editor                    // Editor module
    ├── Screen                    // Player module
    └── Mobile                    // Mobile module
```

---

### Data

Slide data is primarily composed of two parts: `slides` and `theme`.

> In a production environment, generally only these two items need to be persisted.

- **`slides`** represents the slide page data, including each page’s ID, element content, notes, background, animations, transition modes, etc.
- **`theme`** represents the slide theme data, including background color, primary color, font color, fonts, etc.

You can view the exact type definitions here:
[https://github.com/pipipi-pikachu/PPTist/blob/master/src/types/slides.ts](https://github.com/pipipi-pikachu/PPTist/blob/master/src/types/slides.ts)
