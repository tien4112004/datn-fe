import * as React from 'react';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Calendar } from '@ui/calendar';
import { cn } from '@ui/lib/utils';

export interface DateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  modal?: boolean;
  disabled?: boolean;
  className?: string;
}

const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(
  (
    {
      className,
      value,
      onChange,
      fromYear = new Date().getFullYear() - 100,
      toYear = new Date().getFullYear(),
      minDate = new Date(new Date().getFullYear() - 100, 0, 1),
      maxDate = new Date(),
      disabled,
      locale,
      modal = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={modal}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              'border-input bg-background text-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm shadow-xs transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
              'disabled:pointer-events-none disabled:opacity-50',
              className
            )}
          >
            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <span>{value ? format(value, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setIsOpen(false);
            }}
            disabled={(date) => date > maxDate || date < minDate}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            locale={locale}
            classNames={{
              dropdown: 'absolute bg-popover inset-0 opacity-0 max-h-40 overflow-y-auto',
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DateInput.displayName = 'DateInput';

export { DateInput };
