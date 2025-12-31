import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Card, CardContent } from '@/shared/components/ui/card';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, ViewMode, Answer } from '../types';
import { VIEW_MODE } from '../types';
import { QuestionCollectionItem } from './QuestionCollectionItem';

interface QuestionCollectionManagerProps {
  viewMode: ViewMode;
  questions: Question[];
  answers?: Map<string, Answer>;
  currentIndex?: number;
  onChange?: (questions: Question[]) => void;
  onAnswersChange?: (answers: Map<string, Answer>) => void;
  onGradesChange?: (grades: Map<string, { points: number; feedback?: string }>) => void;
}

export const QuestionCollectionManager = ({
  viewMode,
  questions,
  answers = new Map(),
  currentIndex: _currentIndex = 0,
  onChange,
  onAnswersChange,
  onGradesChange: _onGradesChange,
}: QuestionCollectionManagerProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    () => new Set(questions.map((q) => q.id))
  );

  const isEditingMode = viewMode === VIEW_MODE.EDITING;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex);
        onChange?.(newQuestions);
      }
    },
    [questions, onChange]
  );

  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      // Prevent deleting the last question
      return;
    }

    const newQuestions = questions.filter((q) => q.id !== questionId);
    onChange?.(newQuestions);

    // Remove answer for deleted question
    if (answers.has(questionId)) {
      const newAnswers = new Map(answers);
      newAnswers.delete(questionId);
      onAnswersChange?.(newAnswers);
    }

    // Remove from expanded set
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleToggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    const newQuestions = questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q));
    onChange?.(newQuestions);
  };

  const handleAnswerChange = (answer: Answer) => {
    const newAnswers = new Map(answers);
    newAnswers.set(answer.questionId, answer);
    onAnswersChange?.(newAnswers);
  };

  return (
    <div className="space-y-4">
      {/* Questions List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('collection.management.noQuestions')}</p>
              {isEditingMode && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {t('collection.management.addFirstQuestion')}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              {questions.map((question, index) => (
                <QuestionCollectionItem
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  viewMode={viewMode}
                  answer={answers.get(question.id)}
                  isExpanded={expandedQuestions.has(question.id)}
                  onToggleExpand={() => handleToggleExpand(question.id)}
                  onDelete={
                    isEditingMode && questions.length > 1
                      ? () => handleDeleteQuestion(question.id)
                      : undefined
                  }
                  onChange={isEditingMode ? handleQuestionChange : undefined}
                  onAnswerChange={viewMode === VIEW_MODE.DOING ? handleAnswerChange : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
