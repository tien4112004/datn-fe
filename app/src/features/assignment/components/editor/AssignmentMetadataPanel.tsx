import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

export const AssignmentMetadataPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadata' });

  // Get data and actions from store - Basic Info
  const title = useAssignmentFormStore((state) => state.title);
  const description = useAssignmentFormStore((state) => state.description);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const setTitle = useAssignmentFormStore((state) => state.setTitle);
  const setDescription = useAssignmentFormStore((state) => state.setDescription);
  const setSubject = useAssignmentFormStore((state) => state.setSubject);
  const setGrade = useAssignmentFormStore((state) => state.setGrade);

  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <div className="flex items-center gap-3 border-b pb-4">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs text-gray-600 dark:text-gray-400">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter assignment title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className="text-xs text-gray-600 dark:text-gray-400">
                Subject *
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="mt-1.5 h-9 text-sm">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj.code} value={subj.code}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade" className="text-xs text-gray-600 dark:text-gray-400">
                Grade
              </Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade" className="mt-1.5 h-9 text-sm">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.code} value={g.code}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs text-gray-600 dark:text-gray-400">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 text-sm"
              rows={3}
              placeholder="Enter assignment description (optional)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
