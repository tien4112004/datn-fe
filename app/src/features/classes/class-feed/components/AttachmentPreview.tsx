import { Archive, FileDown, FileSpreadsheet, FileText, Paperclip, Presentation } from 'lucide-react';

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

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to simple link
      window.open(url, '_blank');
    }
  };

  const fileName = getFileName(url);
  const fileType = getFileType(url);
  const isImage = fileType.startsWith('image/');

  if (isImage) {
    return (
      <div className={`relative overflow-hidden rounded-lg border ${className}`}>
        <div className="group relative aspect-video w-full max-w-md">
          <img src={url} alt={fileName} className="h-full w-full object-cover" />
          <button
            onClick={handleDownload}
            className="absolute right-2 top-2 flex cursor-pointer items-center rounded-lg bg-black/60 p-2 text-white transition-all hover:bg-black/80"
            title={fileName}
          >
            <FileDown className="h-4 w-4" />
          </button>
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
    <div className={`bg-muted/50 flex items-center gap-2 rounded-lg border p-2 md:gap-3 md:p-3 ${className}`}>
      {getFileIcon(fileType)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName}</p>
      </div>
      <button onClick={handleDownload} className="text-primary hover:text-primary/80">
        <FileDown className="h-5 w-5" />
      </button>
    </div>
  );
};
