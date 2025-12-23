import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
}

export function Checkbox({ checked, onCheckedChange, onChange, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    onChange?.(e as unknown as any);
  };

  return <input type="checkbox" checked={checked} onChange={handleChange} {...props} />;
}

export default Checkbox;
