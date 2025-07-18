import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Question } from './types/types';
import SortableQuestion from './SortableQuestion';

const MultipleChoiceDemo = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: 'What is the capital of France?',
      options: [
        { id: '1a', text: 'London', isCorrect: false },
        { id: '1b', text: 'Berlin', isCorrect: false },
        { id: '1c', text: 'Paris', isCorrect: true },
        { id: '1d', text: 'Madrid', isCorrect: false },
      ],
    },
    {
      id: '2',
      question: 'Which programming language is known for its use in web development?',
      options: [
        { id: '2a', text: 'Python', isCorrect: false },
        { id: '2b', text: 'JavaScript', isCorrect: true },
        { id: '2c', text: 'C++', isCorrect: false },
        { id: '2d', text: 'Java', isCorrect: false },
      ],
    },
    {
      id: '3',
      question: 'What does HTML stand for?',
      options: [
        { id: '3a', text: 'HyperText Markup Language', isCorrect: true },
        { id: '3b', text: 'High Tech Modern Language', isCorrect: false },
        { id: '3c', text: 'Home Tool Markup Language', isCorrect: false },
        { id: '3d', text: 'Hyperlink and Text Markup Language', isCorrect: false },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle question reordering
      if (activeId.startsWith('question-') && overId.startsWith('question-')) {
        const activeQuestionId = activeId.replace('question-', '');
        const overQuestionId = overId.replace('question-', '');

        setQuestions((prevQuestions) => {
          const oldIndex = prevQuestions.findIndex((q) => q.id === activeQuestionId);
          const newIndex = prevQuestions.findIndex((q) => q.id === overQuestionId);
          return arrayMove(prevQuestions, oldIndex, newIndex);
        });
      }
    }
  };

  const handleOptionDragEnd = (_questionId: string, event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle option reordering within the same question
      if (activeId.startsWith('option-') && overId.startsWith('option-')) {
        const activeQuestionId = activeId.split('-')[1];
        const overQuestionId = overId.split('-')[1];

        // Only allow reordering within the same question
        if (activeQuestionId !== overQuestionId) return;

        setQuestions((prevQuestions) => {
          const newQuestions = [...prevQuestions];
          const questionIndex = newQuestions.findIndex((q) => q.id === activeQuestionId);
          const question = newQuestions[questionIndex];

          const activeOptionId = activeId.split('-')[2];
          const overOptionId = overId.split('-')[2];

          const oldIndex = question.options.findIndex((option) => option.id === activeOptionId);
          const newIndex = question.options.findIndex((option) => option.id === overOptionId);

          newQuestions[questionIndex] = {
            ...question,
            options: arrayMove(question.options, oldIndex, newIndex),
          };

          return newQuestions;
        });
      }
    }
  };

  return (
    <div className="w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Multiple Choice Questions - DnD Kit Demo</h1>
      </div>

      <div className="space-y-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
          <SortableContext
            items={questions.map((question) => `question-${question.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, questionIndex) => (
              <SortableQuestion
                key={question.id}
                question={question}
                index={questionIndex}
                onOptionDragEnd={handleOptionDragEnd}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default MultipleChoiceDemo;
