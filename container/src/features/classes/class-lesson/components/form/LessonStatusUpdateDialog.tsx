import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lesson, LessonStatus } from '../../types';

interface LessonStatusUpdateDialogProps {
  selectedLesson: Lesson | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (lessonId: string, status: LessonStatus, notes?: string) => Promise<void>;
}

export const LessonStatusUpdateDialog = ({
  selectedLesson,
  isOpen,
  onOpenChange,
  onUpdateStatus,
}: LessonStatusUpdateDialogProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.status' });
  const [newStatus, setNewStatus] = useState<LessonStatus>('planned');
  const [statusNotes, setStatusNotes] = useState('');

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedLesson) return;

    try {
      await onUpdateStatus(selectedLesson.id, newStatus, statusNotes);
      onOpenChange(false);
      setStatusNotes('');
    } catch (error) {
      console.error('Failed to update lesson status:', error);
    }
  };

  const statusOptions = [
    { value: 'planned', label: t('statuses.planned') },
    { value: 'in_progress', label: t('statuses.inProgress') },
    { value: 'completed', label: t('statuses.completed') },
    { value: 'cancelled', label: t('statuses.cancelled') },
  ];

  // Reset form when dialog opens with a new lesson
  React.useEffect(() => {
    if (selectedLesson && isOpen) {
      setNewStatus(selectedLesson.status);
      setStatusNotes(selectedLesson.notes || '');
    }
  }, [selectedLesson, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('updateStatus')} - {selectedLesson?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('newStatus')}</label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as LessonStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.value as LessonStatus)}
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('notes')}</label>
            <Textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder={t('addStatusNotes')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleStatusUpdate}>{t('updateStatus')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
