import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  getAllDifficulties,
  getAllQuestionTypes,
  getDifficultyI18nKey,
  getQuestionTypeI18nKey,
} from '@aiprimary/core';
import { QuestionTypeIcon } from '@/features/question/components/shared/QuestionTypeIcon';
import type { MatrixCell, AssignmentTopic, QuestionType } from '../../types';
import { MatrixCellView } from './MatrixCellView';

interface MatrixGridViewProps {
  topics: AssignmentTopic[];
  matrixCells: MatrixCell[];
}

export const MatrixGridView = ({ topics, matrixCells }: MatrixGridViewProps) => {
  const { t: tDifficulty } = useTranslation('questions');
  const { t: tQuestionType } = useTranslation('questions');

  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400">No topics in the assignment</p>
      </div>
    );
  }

  const difficulties = getAllDifficulties();
  const questionTypes = getAllQuestionTypes();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          {/* First header row: Topic + Difficulties spanning questionTypes */}
          <TableRow>
            <TableHead rowSpan={2} className="w-[160px] bg-gray-50 font-semibold dark:bg-gray-900">
              Topic
            </TableHead>
            {difficulties.map((difficulty) => (
              <TableHead
                key={difficulty.value}
                colSpan={questionTypes.length}
                className="bg-gray-50 text-center text-xs font-semibold dark:bg-gray-900"
              >
                {tDifficulty(getDifficultyI18nKey(difficulty.value) as any)}
              </TableHead>
            ))}
          </TableRow>
          {/* Second header row: Question types under each difficulty */}
          <TableRow>
            {difficulties.map((difficulty) =>
              questionTypes.map((questionType) => (
                <TableHead
                  key={`${difficulty.value}-${questionType.value}`}
                  className="w-[70px] bg-gray-100 text-center dark:bg-gray-800"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <QuestionTypeIcon type={questionType.value as QuestionType} className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tQuestionType(getQuestionTypeI18nKey(questionType.value) as any)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell className="w-[160px] align-top font-medium">
                <div className="space-y-1">
                  <div className="whitespace-normal break-words">{topic.name}</div>
                  {/* Display subtopics as informational chips */}
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {topic.subtopics.map((subtopic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {subtopic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TableCell>
              {difficulties.map((difficulty, difficultyIndex) =>
                questionTypes.map((questionType) => {
                  const cell = matrixCells.find(
                    (c) =>
                      c.topicId === topic.id &&
                      c.difficulty === difficulty.value &&
                      c.questionType === questionType.value
                  );
                  const bgColor =
                    difficultyIndex % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900';
                  return (
                    <TableCell
                      key={`${topic.id}-${difficulty.value}-${questionType.value}`}
                      className={`w-[70px] p-1 text-center ${bgColor}`}
                    >
                      <MatrixCellView cell={cell} />
                    </TableCell>
                  );
                })
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
