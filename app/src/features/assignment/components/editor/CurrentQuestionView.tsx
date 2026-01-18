import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Trash2, Eye, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { QuestionRenderer } from '@/features/question';
import { VIEW_MODE, type Question, getQuestionTypeName, getAllDifficulties } from '@aiprimary/core';

export const CurrentQuestionView = () => {
  const { t } = useTranslation('assignment');
  const { t: tQuestion } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.currentQuestion' });
  const { t: tQuestions } = useTranslation('questions');

  // Get data and actions from stores
  const questions = useAssignmentFormStore((state) => state.questions);
  const topics = useAssignmentFormStore((state) => state.topics);
  const removeQuestion = useAssignmentFormStore((state) => state.removeQuestion);
  const updateQuestion = useAssignmentFormStore((state) => state.updateQuestion);

  const currentQuestionIndex = useAssignmentEditorStore((state) => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);
  const questionViewModes = useAssignmentEditorStore((state) => state.questionViewModes);
  const toggleQuestionViewMode = useAssignmentEditorStore((state) => state.toggleQuestionViewMode);

  const assignmentQuestion = questions[currentQuestionIndex];
  const question = assignmentQuestion?.question;
  const points = assignmentQuestion?.points || 0;

  const viewMode = questionViewModes.get(question?.id || '') || VIEW_MODE.EDITING;
  const isEditing = viewMode === VIEW_MODE.EDITING;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleDelete = () => {
    if (question) {
      const confirmMessage = t('collection.item.removeQuestionConfirm', {
        type: getQuestionTypeName(question.type),
      });
      if (window.confirm(confirmMessage)) {
        removeQuestion(currentQuestionIndex);
        // Adjust current index if needed
        if (currentQuestionIndex >= questions.length - 1 && currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
      }
    }
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    updateQuestion(currentQuestionIndex, {
      question: {
        ...question,
        ...updatedQuestion,
      },
    });
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{tQuestion('noQuestions')}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{tQuestion('addQuestionHint')}</p>
        </div>
      </div>
    );
  }

  if (!assignmentQuestion || !question) {
    return (
      <div className="border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-950/20">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400">{tQuestion('dataMissing')}</div>
      </div>
    );
  }

  return (
    <div className="border">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {tQuestion('questionOf', { current: currentQuestionIndex + 1, total: questions.length })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{getQuestionTypeName(question.type)}</span>

          {/* Edit/Preview Toggle */}
          <div className="flex items-center rounded border">
            <Button
              type="button"
              variant={isEditing ? 'default' : 'ghost'}
              size="sm"
              onClick={() => !isEditing && toggleQuestionViewMode(question.id)}
              className="h-7 rounded-r-none px-2"
            >
              <Pencil className="mr-1 h-3 w-3" />
              <span className="text-xs">{tQuestion('edit')}</span>
            </Button>
            <Button
              type="button"
              variant={!isEditing ? 'default' : 'ghost'}
              size="sm"
              onClick={() => isEditing && toggleQuestionViewMode(question.id)}
              className="h-7 rounded-l-none px-2"
            >
              <Eye className="mr-1 h-3 w-3" />
              <span className="text-xs">{tQuestion('preview')}</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-4 px-4 py-4">
        {/* Topic, Difficulty, and Points */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label
              htmlFor={`topic-${currentQuestionIndex}`}
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              {t('collection.item.topicLabel')}
            </Label>
            <Select
              value={question.topicId}
              onValueChange={(value) =>
                updateQuestion(currentQuestionIndex, {
                  question: { ...question, topicId: value },
                })
              }
            >
              <SelectTrigger id={`topic-${currentQuestionIndex}`} className="h-9 text-sm">
                <SelectValue placeholder={t('collection.item.selectTopicPlaceholder') as string} />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor={`difficulty-${currentQuestionIndex}`}
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              {t('collection.item.difficultyLabel')}
            </Label>
            <Select
              value={question.difficulty}
              onValueChange={(value) =>
                updateQuestion(currentQuestionIndex, {
                  question: { ...question, difficulty: value as any },
                })
              }
            >
              <SelectTrigger id={`difficulty-${currentQuestionIndex}`} className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllDifficulties().map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {(tQuestions as any)(difficulty.i18nKey!)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor={`points-${currentQuestionIndex}`}
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              {t('collection.item.pointsLabel')}
            </Label>
            <Input
              id={`points-${currentQuestionIndex}`}
              type="number"
              value={points}
              onChange={(e) =>
                updateQuestion(currentQuestionIndex, {
                  points: parseInt(e.target.value, 10) || 0,
                })
              }
              min={0}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* QuestionRenderer */}
        <div className="pt-2">
          <QuestionRenderer
            question={question as Question}
            viewMode={viewMode}
            points={points}
            onChange={handleQuestionChange}
          />
        </div>
      </div>
    </div>
  );
};
