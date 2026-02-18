import * as React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/button';
import { ScrollArea } from '@ui/scroll-area';

export interface TimeInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: string;
  onChange?: (time: string) => void;
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value = '12:00', onChange, disabled, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState(value);
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    React.useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      // Validate time format HH:MM
      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val)) {
        onChange?.(val);
      }
    };

    const handleTimeSelect = (hour: string, minute: string) => {
      const time = `${hour}:${minute}`;
      setInputValue(time);
      onChange?.(time);
      setIsOpen(false);
    };

    const currentHour = inputValue.split(':')[0] || '12';
    const currentMinute = inputValue.split(':')[1] || '00';

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          <Input
            type="text"
            placeholder="HH:MM"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={cn('pr-10', className)}
            ref={ref}
            {...props}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors disabled:pointer-events-none disabled:opacity-50"
              disabled={disabled}
            >
              <Clock className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Hours */}
            <div className="border-r">
              <div className="border-b px-3 py-2 text-center text-sm font-medium">Hour</div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {hours.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      variant={hour === currentHour ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => handleTimeSelect(hour, currentMinute)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Minutes */}
            <div>
              <div className="border-b px-3 py-2 text-center text-sm font-medium">Minute</div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {minutes
                    .filter((_, i) => i % 5 === 0)
                    .map((minute) => (
                      <Button
                        key={minute}
                        type="button"
                        variant={minute === currentMinute ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => handleTimeSelect(currentHour, minute)}
                      >
                        {minute}
                      </Button>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
TimeInput.displayName = 'TimeInput';

export { TimeInput };
