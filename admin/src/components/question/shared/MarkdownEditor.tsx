import { AutosizeTextarea } from '@ui/autosize-textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  disabled?: boolean;
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder = 'Enter text (markdown supported)...',
  minHeight = 100,
  className,
  disabled = false,
}: MarkdownEditorProps) => {
  return (
    <AutosizeTextarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      minHeight={minHeight}
      disabled={disabled}
      className={cn('font-mono text-sm', className)}
    />
  );
};
