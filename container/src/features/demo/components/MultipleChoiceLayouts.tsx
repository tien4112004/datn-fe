import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Question } from '../types/types';
import Workspace from './Workspace';
import Panel from './Panel';

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
    // {
    //   id: '2',
    //   question: 'Which programming language is known for its use in web development?',
    //   options: [
    //     { id: '2a', text: 'Python', isCorrect: false },
    //     { id: '2b', text: 'JavaScript', isCorrect: true },
    //     { id: '2c', text: 'C++', isCorrect: false },
    //     { id: '2d', text: 'Java', isCorrect: false },
    //   ],
    // },
    // {
    //   id: '3',
    //   question: 'What does HTML stand for?',
    //   options: [
    //     { id: '3a', text: 'HyperText Markup Language', isCorrect: true },
    //     { id: '3b', text: 'High Tech Modern Language', isCorrect: false },
    //     { id: '3c', text: 'Home Tool Markup Language', isCorrect: false },
    //     { id: '3d', text: 'Hyperlink and Text Markup Language', isCorrect: false },
    //   ],
    // },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleNewQuestionDragEnd = (event: DragEndEvent) => {
    if (event.active.data.current?.type === 'question-template') {
      const newQuestion: Question = {
        id: String(questions.length + 1),
        question: 'New Question',
        options: [
          { id: `new-${questions.length + 1}-a`, text: 'Option A', isCorrect: false },
          { id: `new-${questions.length + 1}-b`, text: 'Option B', isCorrect: false },
          { id: `new-${questions.length + 1}-c`, text: 'Option C', isCorrect: false },
          { id: `new-${questions.length + 1}-d`, text: 'Option D', isCorrect: false },
        ],
      };
      setQuestions([...questions, newQuestion]);
    }
  };

  return (
    <div className="w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Multiple Choice Questions - DnD Kit Demo</h1>
      </div>

      <div className="flex space-x-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNewQuestionDragEnd}>
          <Workspace questions={questions} setQuestions={setQuestions} />
          <Panel />
        </DndContext>
      </div>
    </div>
  );
};

export default MultipleChoiceDemo;
