import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonResource } from '../../types';

export const ResourceListCommand = ({
  onResourcesSelect,
}: {
  onResourcesSelect: (resources: Array<LessonResource>) => void;
}) => {
  const { t } = useTranslation('classes');
  const [resourceSearchOpen, setResourceSearchOpen] = useState(false);
  const [linkedResources, setLinkedResources] = useState<Array<LessonResource>>([]);

  const handleResourceSelect = (resources: LessonResource[]) => {
    setLinkedResources(resources);
    onResourcesSelect(resources);
  };

  // TODO: Replace with actual linked resources state management
  const availableResources = [
    { id: 'res-1', name: 'Textbook PDF' },
    { id: 'res-2', name: 'Video Tutorial' },
    { id: 'res-3', name: 'Interactive Quiz' },
    { id: 'res-4', name: 'Reference Guide' },
    { id: 'res-5', name: 'Practice Worksheet' },
  ];

  const addResource = (resourceId: string, resourceName: string) => {
    if (!linkedResources.find((r) => r.id === resourceId)) {
      handleResourceSelect([...linkedResources, { id: resourceId, name: resourceName } as any]);
    }
  };

  const removeResource = (resourceId: string) => {
    handleResourceSelect(linkedResources.filter((r) => r.id !== resourceId) as any);
  };

  return (
    <>
      <Popover open={resourceSearchOpen} onOpenChange={setResourceSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={resourceSearchOpen}
            className="w-full justify-between"
          >
            {linkedResources.length > 0
              ? t('integration.resourceSelection.resourcesSelected', {
                  count: linkedResources.length,
                })
              : t('integration.resourceSelection.selectResources')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="pointer-events-auto z-50 w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t('integration.resourceSelection.searchResources')} />
            <CommandList>
              <CommandEmpty>{t('integration.resourceSelection.noResourcesFound')}</CommandEmpty>
              <CommandGroup heading={t('integration.resourceSelection.availableResources')}>
                {availableResources.map((resource) => (
                  <CommandItem
                    key={resource.id}
                    value={resource.id}
                    onSelect={() => {
                      if (linkedResources.find((r) => r.id === resource.id)) {
                        removeResource(resource.id);
                      } else {
                        addResource(resource.id, resource.name);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        linkedResources.find((r) => r.id === resource.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {resource.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Linked Resources Display */}
      {linkedResources.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {linkedResources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
            >
              <span>{resource.name}</span>
              <Button
                type="button"
                variant={'ghost'}
                onClick={() => removeResource(resource.id)}
                className="hover:text-green-900"
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
