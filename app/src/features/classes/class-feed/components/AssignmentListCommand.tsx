import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from '@/components/ui/command';
import { useAssignmentList } from '@/features/assignment/hooks';
import type { Assignment } from '@/features/assignment';

interface AssignmentListCommandProps {
  classId?: string;
  selectedAssignmentId?: string;
  onAssignmentSelect: (assignment: Assignment | null) => void;
}

export const AssignmentListCommand = ({
  classId,
  selectedAssignmentId,
  onAssignmentSelect,
}: AssignmentListCommandProps) => {
  const { t } = useTranslation('classes');
  const [assignmentSearchOpen, setAssignmentSearchOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Fetch assignments from API
  const { data, isLoading } = useAssignmentList({ classId });

  // Map API response to Assignment interface
  const availableAssignments: Assignment[] =
    data?.assignments?.map((a) => ({
      id: a.id,
      title: a.title,
    })) ?? [];

  // If selectedAssignmentId is provided and no local selection, find and set it
  const effectiveSelection =
    selectedAssignment ??
    (selectedAssignmentId ? availableAssignments.find((a) => a.id === selectedAssignmentId) : null);

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    onAssignmentSelect(assignment);
    setAssignmentSearchOpen(false);
  };

  return (
    <Popover open={assignmentSearchOpen} onOpenChange={setAssignmentSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={assignmentSearchOpen}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('integration.assignmentSelection.loading')}
            </>
          ) : effectiveSelection ? (
            effectiveSelection.title
          ) : (
            t('integration.assignmentSelection.selectAssignment')
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto z-50 w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={t('integration.assignmentSelection.searchAssignments')} />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t('integration.assignmentSelection.loading')
                : t('integration.assignmentSelection.noAssignmentsFound')}
            </CommandEmpty>
            <CommandGroup heading={t('integration.assignmentSelection.availableAssignments')}>
              {availableAssignments.map((assignment) => (
                <CommandItem
                  key={assignment.id}
                  value={assignment.title}
                  onSelect={() => handleSelectAssignment(assignment)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      effectiveSelection?.id === assignment.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {assignment.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
