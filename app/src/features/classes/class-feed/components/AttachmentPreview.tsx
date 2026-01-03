import { FileDown, FileText, FileSpreadsheet, Presentation, Archive, Paperclip } from 'lucide-react';

interface AttachmentPreviewProps {
  url: string;
  className?: string;
}

export const AttachmentPreview = ({ url, className = '' }: AttachmentPreviewProps) => {
  // Extract filename from URL
  const getFileName = (urlString: string): string => {
    try {
      const urlObj = new URL(urlString);
      const pathname = urlObj.pathname;
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
      return decodeURIComponent(filename) || 'attachment';
    } catch {
      return 'attachment';
    }
  };

  // Determine file type from URL extension
  const getFileType = (urlString: string): string => {
    const filename = getFileName(urlString);
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.zip': 'application/zip',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  };

  const fileName = getFileName(url);
  const fileType = getFileType(url);
  const isImage = fileType.startsWith('image/');

  if (isImage) {
    return (
      <div className={`overflow-hidden rounded-lg border ${className}`}>
        <img src={url} alt={fileName} className="h-48 w-full object-cover" />
        <div className="bg-muted p-2">
          <p className="truncate text-sm font-medium">{fileName}</p>
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
      {getFileIcon(fileType)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName}</p>
      </div>
      <a href={url} download={fileName} className="text-primary hover:text-primary/80">
        <FileDown className="h-5 w-5" />
      </a>
    </div>
  );
};
