# @aiprimary/frontend-data

Shared frontend data package containing templates, themes, and reusable components for use across all AIPRIMARY frontend applications.

## Overview

This package provides centralized access to:

- **Slide Templates**: Pre-built layout templates for different slide types (title, list, timeline, etc.)
- **Type Definitions**: Shared TypeScript types for templates, themes, and graphics
- **Themes**: Slide theme configurations
- **Graphics**: Decorative elements and visual components

## Installation

This package is part of the AIPRIMARY monorepo and should be installed via pnpm workspaces:

```bash
pnpm install
```

## Usage

### Importing Templates

```typescript
import { titleTemplates, listTemplates } from '@aiprimary/frontend-data/templates/slide/converters';

// Get all title templates
console.log(titleTemplates); // Array of Template objects

// Get all list templates
console.log(listTemplates); // Array of Template objects
```

### Importing Types

```typescript
import type {
  Template,
  TemplateConfig,
  SlideTheme,
  GraphicElement
} from '@aiprimary/frontend-data';
```

### Available Template Types

- `titleTemplates` - Title slide layouts
- `listTemplates` - List and bullet point layouts
- `twoColumnTemplates` - Two-column layouts
- `timelineTemplates` - Timeline and chronological layouts
- `pyramidTemplates` - Hierarchical/pyramid layouts
- `labeledListTemplates` - Labeled list layouts
- `mainImageTemplates` - Image-focused layouts
- `tableOfContentsTemplates` - Table of contents layouts
- `twoColumnWithImageTemplates` - Two-column layouts with images

## Template Structure

Each template follows this structure:

```typescript
interface Template {
  id: string;           // Unique identifier
  name: string;         // Human-readable name
  config: PartialTemplateConfig;  // Layout configuration
  graphics?: GraphicElement[];    // Optional decorative elements
  parameters?: TemplateParameter[]; // Customizable parameters
}
```

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Architecture

```
src/
├── index.ts              # Main entry point
├── types/                # Type definitions
│   ├── index.ts
│   ├── template.ts       # Template types
│   ├── layout.ts         # Layout block types
│   ├── base.ts          # Base types (Position, Size, etc.)
│   ├── expressions.ts   # Expression evaluation types
│   ├── graphics.ts      # Graphics element types
│   ├── slides.ts        # Slide theme types
│   └── styling.ts       # Styling types
├── templates/           # Template definitions
│   └── slide/
│       ├── index.ts
│       ├── types/
│       └── converters/  # Template implementations
├── graphics/            # Graphics definitions
├── themes/              # Theme definitions
└── utils/               # Utility functions
```

## Contributing

When adding new templates:

1. Create the template file in `src/templates/slide/converters/`
2. Export the template array from `converters/index.ts`
3. Update this README if adding new template categories
4. Ensure proper TypeScript types are used

When adding new types:

1. Add to the appropriate file in `src/types/`
2. Export from `types/index.ts`
3. Update the main `index.ts` if it's a public API type