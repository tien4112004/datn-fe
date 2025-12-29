import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { cn } from '@/shared/lib/utils';

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
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      value,
      onChange,
      fromYear = 1900,
      toYear = new Date().getFullYear(),
      minDate = new Date('1900-01-01'),
      maxDate = new Date(),
      disabled,
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DateInput.displayName = 'DateInput';

export { DateInput };
