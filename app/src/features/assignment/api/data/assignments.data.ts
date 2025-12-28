import type { Assignment } from '@aiprimary/core';
import { DIFFICULTY, QUESTION_TYPE } from '@aiprimary/core';

export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    classId: 'class-1',
    title: 'Introduction to Programming - Quiz 1',
    description: 'Basic concepts of programming and algorithms',
    totalPoints: 100,
    dueDate: '2025-01-15T23:59:59Z',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    questions: [
      {
        id: 'q1',
        type: QUESTION_TYPE.MULTIPLE_CHOICE,
        difficulty: DIFFICULTY.EASY,
        title: 'What is the purpose of a **variable** in programming?',
        explanation:
          'A variable is used to **store data** that can be used and manipulated throughout a program. Think of it as a labeled container that holds a value.',
        points: 10,
        data: {
          options: [
            { id: 'opt1', text: 'To store data', isCorrect: true },
            { id: 'opt2', text: 'To execute code', isCorrect: false },
            { id: 'opt3', text: 'To display output', isCorrect: false },
            { id: 'opt4', text: 'To define functions', isCorrect: false },
          ],
        },
      },
      {
        id: 'q2',
        type: QUESTION_TYPE.MATCHING,
        difficulty: DIFFICULTY.MEDIUM,
        title: 'Match the programming concept with its description:',
        explanation:
          'Understanding these fundamental concepts is crucial:\n- **Loop**: Repeats code\n- **Condition**: Makes decisions\n- **Function**: Reusable code block\n- **Array**: Stores multiple values',
        points: 20,
        data: {
          pairs: [
            { id: 'pair1', left: 'Loop', right: 'Repeats code multiple times' },
            { id: 'pair2', left: 'Condition', right: 'Makes decisions in code' },
            { id: 'pair3', left: 'Function', right: 'Reusable block of code' },
            { id: 'pair4', left: 'Array', right: 'Stores multiple values' },
          ],
        },
      },
      {
        id: 'q3',
        type: QUESTION_TYPE.OPEN_ENDED,
        difficulty: DIFFICULTY.HARD,
        title: 'Explain the difference between `let` and `const` in JavaScript.',
        explanation:
          'The key difference is **mutability**:\n- `let` creates a mutable binding (can be reassigned)\n- `const` creates an immutable binding (cannot be reassigned)\n\nNote: `const` with objects/arrays means the reference is immutable, but the contents can still be modified.',
        points: 30,
        data: {
          expectedAnswer:
            '`let` allows you to declare variables that can be reassigned later, while `const` declares variables that cannot be reassigned after initial assignment. `const` is used for values that should remain constant.',
          maxLength: 500,
        },
      },
      {
        id: 'q4',
        type: QUESTION_TYPE.FILL_IN_BLANK,
        difficulty: DIFFICULTY.MEDIUM,
        title: 'Complete the code:',
        explanation:
          'The correct syntax is:\n```javascript\nfor (let i = 0; i < 10; i++) {\n  console.log(i);\n}\n```\nThis creates a standard for loop that iterates from 0 to 9.',
        points: 40,
        data: {
          segments: [
            { id: 'seg1', type: 'text', content: 'for (' },
            { id: 'seg2', type: 'blank', content: 'let', acceptableAnswers: ['let', 'var'] },
            { id: 'seg3', type: 'text', content: ' i = 0; i < ' },
            { id: 'seg4', type: 'blank', content: '10' },
            { id: 'seg5', type: 'text', content: '; i++) {\n  console.log(' },
            { id: 'seg6', type: 'blank', content: 'i' },
            { id: 'seg7', type: 'text', content: ');\n}' },
          ],
          caseSensitive: false,
        },
      },
    ],
  },
];
