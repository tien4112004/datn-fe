import { useRef } from 'react';
import { Paperclip, X, Loader2, File } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

export type AttachedFile = { name: string; url: string; size: number };

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DEFAULT_ACCEPT = '.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp';

interface FileChipsProps {
  attachedFiles: AttachedFile[];
  onRemove: (url: string) => void;
}

export const FileChips = ({ attachedFiles, onRemove }: FileChipsProps) => {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-2 pt-1">
      {attachedFiles.map((file) => (
        <div key={file.url} className="bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
          <File className="text-muted-foreground h-4 w-4 shrink-0" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="max-w-[200px] truncate text-sm">{file.name}</span>
            </TooltipTrigger>
            <TooltipContent>{file.name}</TooltipContent>
          </Tooltip>
          <span className="text-muted-foreground shrink-0 text-xs">{formatFileSize(file.size)}</span>
          <button
            type="button"
            onClick={() => onRemove(file.url)}
            className="text-muted-foreground hover:text-foreground ml-0.5 inline-flex shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

interface FileAttachButtonProps {
  onFilesSelected: (files: FileList) => void;
  isUploading: boolean;
  accept?: string;
  buttonLabel: string;
  uploadingLabel: string;
}

export const FileAttachButton = ({
  onFilesSelected,
  isUploading,
  accept = DEFAULT_ACCEPT,
  buttonLabel,
  uploadingLabel,
}: FileAttachButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={handleChange} />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="shadow-xs text-muted-foreground hover:bg-accent flex h-9 items-center gap-2 whitespace-nowrap rounded-md border bg-transparent px-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{isUploading ? uploadingLabel : buttonLabel}</TooltipContent>
      </Tooltip>
    </>
  );
};
