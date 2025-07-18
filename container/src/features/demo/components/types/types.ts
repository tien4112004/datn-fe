import type { DragEndEvent } from '@dnd-kit/core';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: Option[];
}

export interface SortableOptionProps {
  option: Option;
  index: number;
  questionId: string;
}

export interface SortableQuestionProps {
  question: Question;
  index: number;
  onOptionDragEnd: (questionId: string, event: DragEndEvent) => void;
}