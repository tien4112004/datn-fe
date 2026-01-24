import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DIFFICULTY, getDifficultyName, type Difficulty } from '@aiprimary/core';
import type { MatrixCell, AssignmentTopic } from '../../types';
import { MatrixCellView } from './MatrixCellView';

interface MatrixGridViewProps {
  topics: AssignmentTopic[];
  matrixCells: MatrixCell[];
}

const getAllDifficulties = (): Difficulty[] => {
  return [
    DIFFICULTY.KNOWLEDGE,
    DIFFICULTY.COMPREHENSION,
    DIFFICULTY.APPLICATION,
    DIFFICULTY.ADVANCED_APPLICATION,
  ];
};

export const MatrixGridView = ({ topics, matrixCells }: MatrixGridViewProps) => {
  const difficulties = getAllDifficulties();

  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400">No topics in the assignment</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-50 dark:bg-gray-900">Topic</TableHead>
            {difficulties.map((difficulty) => (
              <TableHead key={difficulty} className="bg-gray-50 text-center dark:bg-gray-900">
                {getDifficultyName(difficulty)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell className="font-medium">{topic.name}</TableCell>
              {difficulties.map((difficulty) => {
                const cell = matrixCells.find((c) => c.topicId === topic.id && c.difficulty === difficulty);
                return (
                  <TableCell key={`${topic.id}-${difficulty}`} className="text-center">
                    <MatrixCellView cell={cell} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
