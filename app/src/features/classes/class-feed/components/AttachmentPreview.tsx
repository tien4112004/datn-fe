import { FileDown, FileText, FileSpreadsheet, Presentation, Archive, Paperclip } from 'lucide-react';
import type { Attachment } from '../types';

interface AttachmentPreviewProps {
  attachment: Attachment;
  className?: string;
}

export const AttachmentPreview = ({ attachment, className = '' }: AttachmentPreviewProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = attachment.fileType.startsWith('image/');

  if (isImage) {
    return (
      <div className={`overflow-hidden rounded-lg border ${className}`}>
        <img src={attachment.url} alt={attachment.fileName} className="h-48 w-full object-cover" />
        <div className="bg-muted p-2">
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          <p className="text-muted-foreground text-xs">{formatFileSize(attachment.fileSize)}</p>
        </div>
      </div>
    );
  }

  // File icon component based on type
  const getFileIcon = (fileType: string) => {
    const iconClass = 'h-5 w-5 text-muted-foreground';
    if (fileType.includes('pdf')) return <FileText className={iconClass} />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className={iconClass} />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel'))
      return <FileSpreadsheet className={iconClass} />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint'))
      return <Presentation className={iconClass} />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <Archive className={iconClass} />;
    return <Paperclip className={iconClass} />;
  };

  return (
    <div className={`bg-muted/50 flex items-center gap-3 rounded-lg border p-3 ${className}`}>
      {getFileIcon(attachment.fileType)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-muted-foreground text-xs">{formatFileSize(attachment.fileSize)}</p>
      </div>
      <a href={attachment.url} download={attachment.fileName} className="text-primary hover:text-primary/80">
        <FileDown className="h-5 w-5" />
      </a>
    </div>
  );
};
