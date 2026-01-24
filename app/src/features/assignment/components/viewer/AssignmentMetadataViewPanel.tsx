import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import type { Assignment } from '../../types';
import { LabelValuePair } from './LabelValuePair';

interface AssignmentMetadataViewPanelProps {
  assignment: Assignment;
}

export const AssignmentMetadataViewPanel = ({ assignment }: AssignmentMetadataViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.metadata' });

  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  const getSubjectName = (code?: string) => {
    if (!code) return '—';
    return subjects.find((s) => s.code === code)?.name || code;
  };

  const getGradeName = (code?: string) => {
    if (!code) return '—';
    return grades.find((g) => g.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('panelTitle')}</h2>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4">
        <LabelValuePair label={t('fields.title')} value={assignment.title} />

        <div className="grid grid-cols-2 gap-4">
          <LabelValuePair label={t('fields.subject')} value={getSubjectName(assignment.subject)} />
          <LabelValuePair label={t('fields.grade')} value={getGradeName(assignment.grade)} />
        </div>

        <LabelValuePair label={t('fields.description')} value={assignment.description} emptyText="—" />

        <LabelValuePair label={t('fields.shuffleQuestions')} value={assignment.shuffleQuestions} />

        {assignment.createdAt && (
          <LabelValuePair
            label={t('fields.createdAt')}
            value={new Date(assignment.createdAt).toLocaleDateString()}
          />
        )}
      </div>
    </div>
  );
};
