import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import type { Locale } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Calendar } from '@ui/calendar';
import { cn } from '@ui/lib/utils';

export interface DateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  modal?: boolean;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
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
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
      if (value) {
        setInputValue(format(value, 'dd/MM/yyyy'));
      } else {
        setInputValue('');
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;
      setInputValue(inputVal);

      const parsedDate = parse(inputVal, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate) && parsedDate >= minDate && parsedDate <= maxDate) {
        onChange?.(parsedDate);
      } else if (inputVal === '') {
        onChange?.(undefined);
      }
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={modal}>
        <div className="relative">
          <Input
            type="text"
            placeholder="DD/MM/YYYY"
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
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              if (date) {
                setInputValue(format(date, 'dd/MM/yyyy'));
              }
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
