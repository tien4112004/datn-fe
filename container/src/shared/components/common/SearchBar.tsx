import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

const SearchBarComponent = ({
  value,
  onChange,
  placeholder = 'Search presentations...',
  className,
  debounceTime = 300,
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Create debounced onChange function
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, debounceTime),
    [onChange]
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    debouncedOnChange.cancel();
    onChange('');
  }, [onChange, debouncedOnChange]);

  return (
    <div className={`relative flex w-full items-center ${className}`}>
      <Search className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
        className={`w-full pl-10 pr-10`}
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

SearchBarComponent.displayName = 'SearchBar';

export const SearchBar = React.memo(SearchBarComponent);
