import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { Button, Group, Input, NumberField } from 'react-aria-components';

export interface NumberInputProps {
  id?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  stepper?: number;
  decimalScale?: number;
  onValueChange?: (value: number | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export const NumberInput = ({
  id,
  value,
  defaultValue,
  min,
  max,
  stepper = 1,
  decimalScale,
  onValueChange,
  className,
  disabled,
}: NumberInputProps) => {
  return (
    <NumberField
      value={value}
      defaultValue={defaultValue}
      minValue={min}
      maxValue={max}
      step={stepper}
      formatOptions={
        decimalScale !== undefined
          ? { maximumFractionDigits: decimalScale, minimumFractionDigits: decimalScale }
          : undefined
      }
      onChange={(val: any) => onValueChange?.(isNaN(val) ? undefined : val)}
      isDisabled={disabled}
      className={`w-full space-y-2 ${className ?? ''}`}
    >
      <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive shadow-xs data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] relative inline-flex h-full w-full min-w-0 items-center overflow-hidden whitespace-nowrap rounded-md border bg-transparent text-base outline-none transition-[color,box-shadow] md:text-sm">
        <Input
          id={id}
          className="selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none"
        />
        <div className="flex h-[calc(100%+2px)] flex-col">
          <Button
            slot="increment"
            className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUpIcon className="size-3" />
            <span className="sr-only">Increment</span>
          </Button>
          <Button
            slot="decrement"
            className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDownIcon className="size-3" />
            <span className="sr-only">Decrement</span>
          </Button>
        </div>
      </Group>
    </NumberField>
  );
};

export default NumberInput;
