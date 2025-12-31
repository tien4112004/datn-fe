import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import useAssignmentEditorStore from '@/features/assignment/stores/assignmentEditorStore';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

// Mock classes - in real app, fetch from API
const MOCK_CLASSES = [
  { id: 'class-1', name: 'Lớp 10A1' },
  { id: 'class-2', name: 'Lớp 10A2' },
  { id: 'class-3', name: 'Lớp 11A1' },
];

export function AssignmentMetadataForm() {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.metadata',
  });

  const { currentAssignment, setTitle, setDescription, setDueDate, setClassId } = useAssignmentEditorStore();

  const dueDate = currentAssignment?.dueDate ? new Date(currentAssignment.dueDate) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="required">
            {t('fields.title')}
          </Label>
          <Input
            id="title"
            placeholder={t('fields.titlePlaceholder')}
            value={currentAssignment?.title || ''}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Class Selection */}
        <div className="space-y-2">
          <Label htmlFor="class" className="required">
            {t('fields.class')}
          </Label>
          <Select value={currentAssignment?.classId || ''} onValueChange={setClassId}>
            <SelectTrigger id="class">
              <SelectValue placeholder={t('fields.classPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CLASSES.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('fields.description')}</Label>
          <Textarea
            id="description"
            placeholder={t('fields.descriptionPlaceholder')}
            value={currentAssignment?.description || ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label>{t('fields.dueDate')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : t('fields.dueDatePlaceholder')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => setDueDate(date?.toISOString())}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
