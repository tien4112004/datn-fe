import { Badge } from '@ui/badge';
import type { AssignmentQuestion } from '@aiprimary/core';
import { getDifficultyName, getQuestionTypeName } from '@aiprimary/core';
import type { AssignmentTopic } from '../../types';

interface QuestionListViewItemProps {
  question: AssignmentQuestion;
  index: number;
  topics: AssignmentTopic[];
}

export const QuestionListViewItem = ({ question, index, topics }: QuestionListViewItemProps) => {
  const topicId = 'topicId' in question.question ? (question.question.topicId as string) : undefined;
  const topic = topicId ? topics.find((t) => t.id === topicId) : undefined;
  const hasTitle = question.question.title && question.question.title.trim() !== '';

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
      {/* Question Number */}
      <div className="flex-shrink-0">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
          {index + 1}
        </div>
      </div>

      {/* Question Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Type Badge */}
          <Badge variant="outline" className="text-xs">
            {getQuestionTypeName(question.question.type)}
          </Badge>

          {/* Difficulty Badge */}
          <Badge variant="secondary" className="text-xs">
            {getDifficultyName(question.question.difficulty)}
          </Badge>

          {/* Topic Badge */}
          {topic && (
            <Badge variant="default" className="text-xs">
              {topic.name}
            </Badge>
          )}
        </div>

        {/* Question Title */}
        <div className="mt-2">
          {hasTitle ? (
            <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {question.question.title}
            </p>
          ) : (
            <p className="text-sm italic text-gray-500 dark:text-gray-400">No question text</p>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="flex-shrink-0">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {question.points || 0} pts
          </div>
        </div>
      </div>
    </div>
  );
};
