import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GroupQuestion, Answer } from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { SubQuestionList } from './SubQuestionList';

interface GroupGradingProps {
  question: GroupQuestion;
  answer?: Answer;
  points?: number;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

/**
 * GroupGrading Component
 *
 * GRADING view mode for group questions. Allows teachers to:
 * - View student's answers alongside correct answers
 * - Manually grade each sub-question
 * - Provide overall feedback
 * - Set total points earned
 */
export function GroupGrading({ question, answer, points, onGradeChange }: GroupGradingProps) {
  const { t } = useTranslation('questions');
  const userAnswers = (answer as any)?.subAnswers || {};
  const [gradeData, setGradeData] = useState({
    points: (answer as any)?.earnedPoints || 0,
    feedback: (answer as any)?.feedback || '',
  });

  const [subGrades, setSubGrades] = useState<Record<string, { points: number; feedback?: string }>>({});

  // Handle sub-question grading
  const handleSubGradeChange = (questionId: string, grade: { points: number; feedback?: string }) => {
    const newSubGrades = { ...subGrades, [questionId]: grade };
    setSubGrades(newSubGrades);

    // Calculate total from sub-grades
    const totalPoints = Object.values(newSubGrades).reduce((sum, g) => sum + g.points, 0);
    const updatedGrade = { ...gradeData, points: totalPoints };
    setGradeData(updatedGrade);

    if (onGradeChange) {
      onGradeChange(updatedGrade);
    }
  };

  // Handle overall feedback change
  const handleFeedbackChange = (feedback: string) => {
    const updatedGrade = { ...gradeData, feedback };
    setGradeData(updatedGrade);

    if (onGradeChange) {
      onGradeChange(updatedGrade);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
        {points !== undefined && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('common.totalPoints')}: {points}
          </p>
        )}
      </div>

      {/* Group Description */}
      {question.data.description && (
        <div
          className="prose dark:prose-invert max-w-none rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          dangerouslySetInnerHTML={{ __html: question.data.description }}
        />
      )}

      {/* Sub-Questions in Grading Mode */}
      <SubQuestionList
        questions={question.data.questions}
        viewMode={VIEW_MODE.GRADING}
        answers={userAnswers}
        showNumbers={question.data.showQuestionNumbers}
        shuffle={false} // Don't shuffle in grading mode
        onGradeChange={handleSubGradeChange}
      />

      {/* Overall Grading Section */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
          {t('group.grading.overallGrade')}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('group.grading.totalPointsEarned')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={points}
                value={gradeData.points}
                onChange={(e) => {
                  const updatedGrade = { ...gradeData, points: Number(e.target.value) };
                  setGradeData(updatedGrade);
                  if (onGradeChange) {
                    onGradeChange(updatedGrade);
                  }
                }}
                className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">/ {points}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('group.grading.overallFeedback')}
            </label>
            <textarea
              value={gradeData.feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              rows={3}
              placeholder={t('group.grading.feedbackPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
