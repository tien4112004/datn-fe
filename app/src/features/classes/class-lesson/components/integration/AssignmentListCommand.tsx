import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { Check } from 'lucide-react';
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

interface Assignment {
  id: string;
  title: string;
}

interface AssignmentListCommandProps {
  onAssignmentSelect: (assignment: Assignment | null) => void;
}

export const AssignmentListCommand = ({ onAssignmentSelect }: AssignmentListCommandProps) => {
  const { t } = useTranslation('classes');
  const [assignmentSearchOpen, setAssignmentSearchOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // TODO: Replace with actual API call to fetch assignments
  const availableAssignments: Assignment[] = [
    { id: 'assignment-1', title: 'Math Homework #1' },
    { id: 'assignment-2', title: 'English Essay' },
    { id: 'assignment-3', title: 'Science Lab Report' },
    { id: 'assignment-4', title: 'History Research Paper' },
    { id: 'assignment-5', title: 'Programming Project' },
  ];

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
        >
          {selectedAssignment
            ? selectedAssignment.title
            : t('integration.assignmentSelection.selectAssignment')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto z-50 w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={t('integration.assignmentSelection.searchAssignments')} />
          <CommandList>
            <CommandEmpty>{t('integration.assignmentSelection.noAssignmentsFound')}</CommandEmpty>
            <CommandGroup heading={t('integration.assignmentSelection.availableAssignments')}>
              {availableAssignments.map((assignment) => (
                <CommandItem
                  key={assignment.id}
                  value={assignment.id}
                  onSelect={() => handleSelectAssignment(assignment)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedAssignment?.id === assignment.id ? 'opacity-100' : 'opacity-0'
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
