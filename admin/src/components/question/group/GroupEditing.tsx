import { useState, useEffect } from 'react';
import { Plus, AlertCircle, ImagePlus, X } from 'lucide-react';
import type { GroupQuestion, SubQuestion } from '@aiprimary/core';
import { SubQuestionList } from './SubQuestionList';
import { generateId } from '@/lib/utils';
import { ImageUploader } from '../shared';
import { Button } from '@/components/ui/button';

interface GroupEditingProps {
  question: GroupQuestion;
  onChange: (updated: GroupQuestion) => void;
}

/**
 * GroupEditing Component (Admin)
 *
 * EDITING view mode for group questions. Allows admins to:
 * - Edit group description
 * - Add/remove sub-questions
 * - Configure display settings
 * - View total points
 */
export function GroupEditing({ question, onChange }: GroupEditingProps) {
  const [description, setDescription] = useState(question.data?.description || '');
  const [questions, setQuestions] = useState<SubQuestion[]>(question.data?.questions || []);
  const [titleImageUrl, setTitleImageUrl] = useState(question.titleImageUrl || '');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    const updated: GroupQuestion = {
      ...question,
      titleImageUrl,
      data: {
        description,
        questions,
        showQuestionNumbers: true, // Always show numbers as a, b, c, d
        shuffleQuestions: false, // Never shuffle
      },
    };
    onChange(updated);
  }, [description, questions, titleImageUrl]);

  // Add a new sub-question
  const handleAddQuestion = (type: 'MULTIPLE_CHOICE' | 'MATCHING' | 'OPEN_ENDED' | 'FILL_IN_BLANK') => {
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
      case 'MATCHING':
        initialData = {
          pairs: [{ id: generateId(), left: '', right: '' }],
          shufflePairs: false,
        };
        break;
      case 'OPEN_ENDED':
        initialData = {
          expectedAnswer: '',
          maxLength: undefined,
        };
        break;
      case 'FILL_IN_BLANK':
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
          Group Description
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            (This will be shown to students)
          </span>
        </label>
        <div className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description or instructions..."
              className="min-h-[120px] w-full flex-1 resize-none border-0 bg-transparent text-gray-900 focus:outline-none focus:ring-0 dark:text-gray-100"
              rows={6}
            />
            {titleImageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTitleImageUrl('')}
                title="Remove image"
                className="self-start"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTitleImageUrl('placeholder')}
                title="Add image"
                className="self-start"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {titleImageUrl !== undefined && titleImageUrl !== '' && (
            <ImageUploader label="Group Image" value={titleImageUrl} onChange={setTitleImageUrl} />
          )}
        </div>
      </div>

      {/* Total Points Display */}
      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Points:</span>
        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{calculateTotalPoints()}</span>
      </div>

      {/* Sub-Questions List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sub-Questions</h3>
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {/* Question Type Selector */}
        {showTypeSelector && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Select question type:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Multiple Choice</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Single correct answer</div>
              </button>
              <button
                onClick={() => handleAddQuestion('MATCHING')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Matching</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Match pairs</div>
              </button>
              <button
                onClick={() => handleAddQuestion('OPEN_ENDED')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Open Ended</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Free text response</div>
              </button>
              <button
                onClick={() => handleAddQuestion('FILL_IN_BLANK')}
                className="rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Fill in Blank</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Complete the sentence</div>
              </button>
            </div>
          </div>
        )}

        {/* Validation Warning */}
        {questions.length === 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Add at least one sub-question to complete this group question.
            </span>
          </div>
        )}

        {/* Render sub-questions in editing mode */}
        <SubQuestionList
          questions={questions}
          viewMode="editing"
          showNumbers={true}
          onChange={setQuestions}
        />
      </div>
    </div>
  );
}
