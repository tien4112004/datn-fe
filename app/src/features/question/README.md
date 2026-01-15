# Question Feature

Reusable question components for rendering, editing, and interacting with various question types.

## Question Types

- **multiple-choice**: Single correct answer from options
- **fill-in-blank**: Text segments with blanks to fill
- **matching**: Matching pairs
- **open-ended**: Free text responses

## View Modes

Each question type supports 5 modes:

- **Editing**: Edit question content
- **Viewing**: Read-only display
- **Doing**: Student answering mode
- **AfterAssessment**: Review with feedback
- **Grading**: Manual grading interface

## Usage

```typescript
import { QuestionRenderer } from '@/features/question';
import { VIEW_MODE } from '@/features/assignment/types';

<QuestionRenderer
  question={question}
  viewMode={VIEW_MODE.DOING}
  onAnswerChange={handleAnswerChange}
/>
```

## Component Structure

```
question/
├── index.ts                          # Main barrel export
├── components/
│   ├── QuestionRenderer.tsx          # Central router component
│   ├── multiple-choice/              # Multiple choice components
│   ├── fill-in-blank/                # Fill in blank components
│   ├── matching/                     # Matching components
│   ├── open-ended/                   # Open ended components
│   └── shared/                       # Shared components
│       ├── AnswerFeedback.tsx
│       ├── DifficultyBadge.tsx
│       ├── ImageUploader.tsx
│       ├── MarkdownEditor.tsx
│       ├── MarkdownPreview.tsx
│       └── QuestionTypeIcon.tsx
└── README.md
```

## Dependencies

- **Types**: Uses types from `@aiprimary/core` and `@/features/assignment/types`
- **i18n**: Uses 'assignment' namespace for translations
- **UI Components**: Uses shared UI components from `@/shared/components/ui`

## Shared Components

### MarkdownEditor
Rich text editor for question content with toolbar and preview.

### MarkdownPreview
Renders markdown content with syntax highlighting.

### ImageUploader
Image upload component with preview and remove functionality.

### DifficultyBadge
Displays question difficulty level (Easy, Medium, Hard).

### QuestionTypeIcon
Icon representing the question type.

### AnswerFeedback
Shows correct/incorrect feedback for student answers.
