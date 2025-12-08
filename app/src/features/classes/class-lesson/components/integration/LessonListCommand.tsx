import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lesson } from '../../types';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from '@/components/ui/command';

export const LessonListCommand = ({
  onLessonsSelect,
}: {
  onLessonsSelect: (lessons: Array<Lesson>) => void;
}) => {
  const { t } = useTranslation('classes');
  const [lessonSearchOpen, setLessonSearchOpen] = useState(false);
  const [linkedLessons, setLinkedLessons] = useState<Array<Lesson>>([]);

  const handleLessonSelect = (lesson: Lesson) => {
    setLinkedLessons((prev) => [...prev, lesson]);
    onLessonsSelect([...linkedLessons, lesson]);
  };

  // TODO: Replace with actual linked lessons state management
  const availableLessons = [
    { id: 'lesson-1', title: 'Introduction to Math' },
    { id: 'lesson-2', title: 'English Grammar Basics' },
    { id: 'lesson-3', title: 'History Timeline' },
    { id: 'lesson-4', title: 'Science Fundamentals' },
    { id: 'lesson-5', title: 'Art and Design' },
  ];

  const addLesson = (lessonId: string, lessonTitle: string) => {
    if (!linkedLessons.find((l) => l.id === lessonId)) {
      handleLessonSelect({ id: lessonId, title: lessonTitle } as any);
    }
  };

  const removeLesson = (lessonId: string) => {
    handleLessonSelect(linkedLessons.filter((l) => l.id !== lessonId) as any);
  };

  return (
    <>
      <Popover open={lessonSearchOpen} onOpenChange={setLessonSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={lessonSearchOpen}
            className="w-full justify-between"
          >
            {linkedLessons.length > 0
              ? t('integration.lessonSelection.lessonsSelected', {
                  count: linkedLessons.length,
                })
              : t('integration.lessonSelection.selectLessons')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="pointer-events-auto z-50 w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t('integration.lessonSelection.searchLessons')} />
            <CommandList>
              <CommandEmpty>{t('integration.lessonSelection.noLessonsFound')}</CommandEmpty>
              <CommandGroup heading={t('integration.lessonSelection.availableLessons')}>
                {availableLessons.map((lesson) => (
                  <CommandItem
                    key={lesson.id}
                    value={lesson.id}
                    onSelect={() => {
                      if (linkedLessons.find((l) => l.id === lesson.id)) {
                        removeLesson(lesson.id);
                      } else {
                        addLesson(lesson.id, lesson.title);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        linkedLessons.find((l) => l.id === lesson.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {lesson.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Linked Lessons Display */}
      {linkedLessons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {linkedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              <span>{lesson.title}</span>
              <Button
                type="button"
                size="icon"
                onClick={() => removeLesson(lesson.id)}
                className="hover:text-blue-900"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
