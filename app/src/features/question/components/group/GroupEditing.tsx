import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle } from 'lucide-react';
import type { GroupQuestion, SubQuestion } from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { SubQuestionList } from './SubQuestionList';
import { generateId } from '@/shared/lib/utils';

interface GroupEditingProps {
  question: GroupQuestion;
  onChange: (updated: GroupQuestion) => void;
}

/**
 * GroupEditing Component
 *
 * EDITING view mode for group questions. Allows teachers to:
 * - Edit group description
 * - Add/remove sub-questions
 * - Configure display settings
 * - View total points
 */
export function GroupEditing({ question, onChange }: GroupEditingProps) {
  const { t } = useTranslation('questions');
  const [description, setDescription] = useState(question.data.description || '');
  const [questions, setQuestions] = useState<SubQuestion[]>(question.data.questions || []);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(question.data.showQuestionNumbers ?? true);
  const [shuffleQuestions, setShuffleQuestions] = useState(question.data.shuffleQuestions ?? false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    const updated: GroupQuestion = {
      ...question,
      data: {
        description,
        questions,
        showQuestionNumbers,
        shuffleQuestions,
      },
    };
    onChange(updated);
  }, [description, questions, showQuestionNumbers, shuffleQuestions]);

  // Add a new sub-question
  const handleAddQuestion = (type: 'MULTIPLE_CHOICE' | 'matching' | 'open_ended' | 'fill_in_blank') => {
    let initialData: any;

    switch (type) {
      case 'MULTIPLE_CHOICE':
        initialData = {
          options: [
            { id: generateId(), text: '', isCorrect: false },
            { id: generateId(), text: '', isCorrect: false },
          ],
          shuffleOptions: false,
        };
        break;
      case 'matching':
        initialData = {
          pairs: [{ id: generateId(), left: '', right: '' }],
          shufflePairs: false,
        };
        break;
      case 'open_ended':
        initialData = {
          expectedAnswer: '',
          maxLength: undefined,
        };
        break;
      case 'fill_in_blank':
        initialData = {
          segments: [],
          caseSensitive: false,
        };
        break;
    }

    const newQuestion: SubQuestion = {
      id: generateId(),
      type,
      title: '',
      data: initialData,
      points: 1,
    };

    setQuestions([...questions, newQuestion]);
    setShowTypeSelector(false);
  };

  // Calculate total points
  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Group Description Editor */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('group.editing.groupDescription')}
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            ({t('group.editing.groupDescriptionHint')})
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('group.editing.groupDescriptionPlaceholder')}
          className="min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          rows={6}
        />
      </div>

      {/* Display Settings */}
      <div className="flex items-center gap-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showQuestionNumbers}
            onChange={(e) => setShowQuestionNumbers(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('group.editing.showNumbers')}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t('group.editing.shuffleQuestions')}
          </span>
        </label>
      </div>

      {/* Total Points Display */}
      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {t('group.editing.totalPoints')}:
        </span>
        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{calculateTotalPoints()}</span>
      </div>

      {/* Sub-Questions List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('group.editing.subQuestions')}
          </h3>
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t('group.editing.addQuestion')}
          </button>
        </div>

        {/* Question Type Selector */}
        {showTypeSelector && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{t('group.editing.selectType')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('group.editing.types.multipleChoice')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('group.editing.types.multipleChoiceDesc')}
                </div>
              </button>
              <button
                onClick={() => handleAddQuestion('matching')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('group.editing.types.matching')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('group.editing.types.matchingDesc')}
                </div>
              </button>
              <button
                onClick={() => handleAddQuestion('open_ended')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('group.editing.types.openEnded')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('group.editing.types.openEndedDesc')}
                </div>
              </button>
              <button
                onClick={() => handleAddQuestion('fill_in_blank')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('group.editing.types.fillInBlank')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('group.editing.types.fillInBlankDesc')}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Validation Warning */}
        {questions.length === 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('group.editing.validationWarning')}
            </span>
          </div>
        )}

        {/* Render sub-questions in editing mode */}
        <SubQuestionList
          questions={questions}
          viewMode={VIEW_MODE.EDITING}
          showNumbers={showQuestionNumbers}
          onChange={setQuestions}
        />
      </div>
    </div>
  );
}
