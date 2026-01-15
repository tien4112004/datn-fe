import { useState } from 'react';
import type {
  Question,
  Answer,
  MultipleChoiceQuestion,
  MatchingQuestion,
  OpenEndedQuestion,
  FillInBlankQuestion,
  GroupQuestion,
  MultipleChoiceAnswer,
  MatchingAnswer,
  OpenEndedAnswer,
  FillInBlankAnswer,
} from '@aiprimary/core';
import { DIFFICULTY } from '@aiprimary/core';
import { QUESTION_TYPE, VIEW_MODE, type ViewMode } from '../types';
import { QuestionRenderer } from '@/features/question';

// Sample Questions
const multipleChoiceQuestion: MultipleChoiceQuestion = {
  id: 'mc-1',
  type: QUESTION_TYPE.MULTIPLE_CHOICE,
  difficulty: DIFFICULTY.EASY,
  title: 'What is the capital of Vietnam?',
  explanation: 'Hanoi has been the capital of Vietnam since 1010 (under the Ly dynasty) and again from 1954.',
  data: {
    options: [
      { id: 'mc-1-a', text: 'Ho Chi Minh City', isCorrect: false },
      { id: 'mc-1-b', text: 'Hanoi', isCorrect: true },
      { id: 'mc-1-c', text: 'Da Nang', isCorrect: false },
      { id: 'mc-1-d', text: 'Hue', isCorrect: false },
    ],
    shuffleOptions: false,
  },
};

const matchingQuestion: MatchingQuestion = {
  id: 'match-1',
  type: QUESTION_TYPE.MATCHING,
  difficulty: DIFFICULTY.MEDIUM,
  title: 'Match the famous Vietnamese landmarks with their cities',
  explanation: 'These are some of the most iconic landmarks in Vietnam.',
  data: {
    pairs: [
      { id: 'pair-1', left: 'Ho Chi Minh Mausoleum', right: 'Hanoi' },
      { id: 'pair-2', left: 'Notre-Dame Cathedral', right: 'Ho Chi Minh City' },
      { id: 'pair-3', left: 'Golden Bridge', right: 'Da Nang' },
      { id: 'pair-4', left: 'Imperial City', right: 'Hue' },
    ],
    shufflePairs: false,
  },
};

const openEndedQuestion: OpenEndedQuestion = {
  id: 'oe-1',
  type: QUESTION_TYPE.OPEN_ENDED,
  difficulty: DIFFICULTY.HARD,
  title: 'Explain the significance of the Battle of Dien Bien Phu in Vietnamese history.',
  explanation:
    'The Battle of Dien Bien Phu (1954) was a decisive victory for the Viet Minh over French colonial forces, leading to the end of French Indochina and Vietnamese independence.',
  data: {
    expectedAnswer:
      'The Battle of Dien Bien Phu was a crucial military victory that led to French withdrawal from Indochina and Vietnamese independence.',
    maxLength: 500,
  },
};

const fillInBlankQuestion: FillInBlankQuestion = {
  id: 'fib-1',
  type: QUESTION_TYPE.FILL_IN_BLANK,
  difficulty: DIFFICULTY.EASY,
  title: 'Complete the sentence about Vietnam',
  explanation: 'These are basic facts about Vietnam.',
  data: {
    segments: [
      { id: 'seg-1', type: 'text', content: 'Vietnam is located in ' },
      {
        id: 'seg-2',
        type: 'blank',
        content: 'Southeast Asia',
        acceptableAnswers: ['southeast asia', 'South East Asia'],
      },
      { id: 'seg-3', type: 'text', content: ' and its currency is the ' },
      { id: 'seg-4', type: 'blank', content: 'dong', acceptableAnswers: ['Dong', 'VND'] },
      { id: 'seg-5', type: 'text', content: '.' },
    ],
    caseSensitive: false,
  },
};

const groupQuestion: GroupQuestion = {
  id: 'group-1',
  type: QUESTION_TYPE.GROUP,
  difficulty: DIFFICULTY.MEDIUM,
  title: 'Reading Comprehension: The Solar System',
  explanation: 'This group question tests understanding of the solar system passage.',
  data: {
    description: `<p><strong>Read the following passage and answer the questions below:</strong></p>
      <p>Our solar system consists of eight planets orbiting around the Sun. The four inner planets (Mercury, Venus, Earth, and Mars) are rocky, while the four outer planets (Jupiter, Saturn, Uranus, and Neptune) are gas giants.</p>
      <p>The Sun, at the center of our solar system, contains 99.8% of the solar system's mass. It provides light and heat to all the planets. Each planet has unique characteristics, from Mercury's extreme temperatures to Neptune's distant blue appearance.</p>`,
    questions: [
      {
        id: 'group-q1',
        type: QUESTION_TYPE.MULTIPLE_CHOICE,
        title: 'How many planets are in our solar system?',
        points: 2,
        data: {
          options: [
            { id: 'opt-1', text: 'Seven', isCorrect: false },
            { id: 'opt-2', text: 'Eight', isCorrect: true },
            { id: 'opt-3', text: 'Nine', isCorrect: false },
            { id: 'opt-4', text: 'Ten', isCorrect: false },
          ],
          shuffleOptions: false,
        },
      },
      {
        id: 'group-q2',
        type: QUESTION_TYPE.FILL_IN_BLANK,
        title: 'Complete the sentence',
        points: 2,
        data: {
          segments: [
            { id: 'seg-1', type: 'text', content: 'The Sun contains ' },
            { id: 'seg-2', type: 'blank', content: '99.8', acceptableAnswers: ['99.8%', '99.8 percent'] },
            { id: 'seg-3', type: 'text', content: "% of the solar system's mass." },
          ],
          caseSensitive: false,
        },
      },
      {
        id: 'group-q3',
        type: QUESTION_TYPE.MATCHING,
        title: 'Match the planets with their categories',
        points: 3,
        data: {
          pairs: [
            { id: 'pair-1', left: 'Mercury', right: 'Inner Planet' },
            { id: 'pair-2', left: 'Jupiter', right: 'Outer Planet' },
            { id: 'pair-3', left: 'Earth', right: 'Inner Planet' },
          ],
          shufflePairs: false,
        },
      },
    ],
    showQuestionNumbers: true,
    shuffleQuestions: false,
  },
};

// Sample Answers
const multipleChoiceAnswer: MultipleChoiceAnswer = {
  questionId: 'mc-1',
  type: QUESTION_TYPE.MULTIPLE_CHOICE,
  selectedOptionId: 'mc-1-b',
};

const matchingAnswer: MatchingAnswer = {
  questionId: 'match-1',
  type: QUESTION_TYPE.MATCHING,
  matches: [
    { leftId: 'pair-1', rightId: 'pair-1' },
    { leftId: 'pair-2', rightId: 'pair-2' },
    { leftId: 'pair-3', rightId: 'pair-3' },
    { leftId: 'pair-4', rightId: 'pair-4' },
  ],
};

const openEndedAnswer: OpenEndedAnswer = {
  questionId: 'oe-1',
  type: QUESTION_TYPE.OPEN_ENDED,
  text: 'The Battle of Dien Bien Phu was a significant military victory for Vietnam that led to independence from France.',
};

const fillInBlankAnswer: FillInBlankAnswer = {
  questionId: 'fib-1',
  type: QUESTION_TYPE.FILL_IN_BLANK,
  blanks: [
    { segmentId: 'seg-2', value: 'Southeast Asia' },
    { segmentId: 'seg-4', value: 'dong' },
  ],
};

const allQuestions: Question[] = [
  multipleChoiceQuestion,
  matchingQuestion,
  openEndedQuestion,
  fillInBlankQuestion,
  groupQuestion,
];

const allAnswers: Answer[] = [
  multipleChoiceAnswer,
  matchingAnswer,
  openEndedAnswer,
  fillInBlankAnswer,
  {} as Answer,
];

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: VIEW_MODE.EDITING, label: 'Editing (Teacher)' },
  { value: VIEW_MODE.VIEWING, label: 'Viewing (Preview)' },
  { value: VIEW_MODE.DOING, label: 'Doing (Student)' },
  { value: VIEW_MODE.AFTER_ASSESSMENT, label: 'After Assessment (Student)' },
  { value: VIEW_MODE.GRADING, label: 'Grading (Teacher)' },
];

export const QuestionRendererDemoPage = () => {
  const [selectedViewMode, setSelectedViewMode] = useState<ViewMode>(VIEW_MODE.VIEWING);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(allQuestions[0]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer>(allAnswers[0]);
  const [gradeInfo, setGradeInfo] = useState<{ points: number; feedback?: string }>({ points: 0 });

  const handleQuestionChange = (index: number) => {
    setSelectedQuestionIndex(index);
    setCurrentQuestion(allQuestions[index]);
    setCurrentAnswer(allAnswers[index]);
    setGradeInfo({ points: 0 });
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setCurrentQuestion(updatedQuestion);
    console.log('Question updated:', updatedQuestion);
  };

  const handleAnswerChange = (updatedAnswer: Answer) => {
    setCurrentAnswer(updatedAnswer);
    console.log('Answer updated:', updatedAnswer);
  };

  const handleGradeChange = (grade: { points: number; feedback?: string }) => {
    setGradeInfo(grade);
    console.log('Grade updated:', grade);
  };

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">QuestionRenderer Demo Page</h1>
        <p className="text-muted-foreground">
          Test the QuestionRenderer component with different question types and view modes
        </p>
      </div>

      {/* Controls */}
      <div className="bg-muted/30 mb-8 grid grid-cols-1 gap-4 rounded-lg p-6 md:grid-cols-2">
        {/* Question Type Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">Question Type</label>
          <div className="flex flex-col gap-2">
            {allQuestions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => handleQuestionChange(index)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  selectedQuestionIndex === index
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                {q.type === QUESTION_TYPE.MULTIPLE_CHOICE && '🔘 Multiple Choice'}
                {q.type === QUESTION_TYPE.MATCHING && '🔗 Matching'}
                {q.type === QUESTION_TYPE.OPEN_ENDED && '✍️ Open Ended'}
                {q.type === QUESTION_TYPE.FILL_IN_BLANK && '📝 Fill in Blank'}
                {q.type === QUESTION_TYPE.GROUP && '📋 Group Question'}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">View Mode</label>
          <div className="flex flex-col gap-2">
            {VIEW_MODE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedViewMode(value)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  selectedViewMode === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current State Info */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div>
            <span className="font-semibold">Question Type:</span>{' '}
            <span className="font-mono">{currentQuestion.type}</span>
          </div>
          <div>
            <span className="font-semibold">View Mode:</span>{' '}
            <span className="font-mono">{selectedViewMode}</span>
          </div>
          <div>
            <span className="font-semibold">Difficulty:</span>{' '}
            <span className="font-mono">{currentQuestion.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Question Renderer */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Question Preview</h2>
        <div className="bg-background rounded-lg border p-6">
          <QuestionRenderer
            question={currentQuestion}
            viewMode={selectedViewMode}
            answer={currentAnswer}
            points={10}
            onChange={handleQuestionUpdate}
            onAnswerChange={handleAnswerChange}
            onGradeChange={handleGradeChange}
          />
        </div>
      </div>

      {/* Debug Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Debug Information</h2>

        <details className="bg-muted/30 rounded-lg">
          <summary className="hover:bg-muted/50 cursor-pointer p-4 font-medium">
            Current Question Data
          </summary>
          <pre className="bg-background m-2 max-h-96 overflow-auto rounded border p-4 text-xs">
            {JSON.stringify(currentQuestion, null, 2)}
          </pre>
        </details>

        <details className="bg-muted/30 rounded-lg">
          <summary className="hover:bg-muted/50 cursor-pointer p-4 font-medium">Current Answer Data</summary>
          <pre className="bg-background m-2 max-h-96 overflow-auto rounded border p-4 text-xs">
            {JSON.stringify(currentAnswer, null, 2)}
          </pre>
        </details>

        {selectedViewMode === VIEW_MODE.GRADING && (
          <details className="bg-muted/30 rounded-lg">
            <summary className="hover:bg-muted/50 cursor-pointer p-4 font-medium">Grade Information</summary>
            <pre className="bg-background m-2 max-h-96 overflow-auto rounded border p-4 text-xs">
              {JSON.stringify(gradeInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Usage Notes */}
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950">
        <h3 className="mb-3 text-lg font-semibold">💡 Usage Notes</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Editing Mode:</strong> Used by teachers to create/edit questions. All fields are editable.
          </li>
          <li>
            <strong>Viewing Mode:</strong> Preview mode showing the question without interactivity. Used in
            question bank preview.
          </li>
          <li>
            <strong>Doing Mode:</strong> Active mode for students to answer questions during an assignment.
          </li>
          <li>
            <strong>After Assessment Mode:</strong> Shows students their answers with correct answers and
            explanations after submission.
          </li>
          <li>
            <strong>Grading Mode:</strong> Used by teachers to manually grade answers (especially for
            open-ended questions).
          </li>
        </ul>
      </div>
    </div>
  );
};
