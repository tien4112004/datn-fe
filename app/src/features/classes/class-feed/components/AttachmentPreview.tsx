import { FileDown } from 'lucide-react';
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
        <div className="bg-gray-50 p-2">
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
        </div>
      </div>
    );
  }

  // File icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📎';
  };

  return (
    <div className={`flex items-center rounded-lg border bg-gray-50 p-3 ${className}`}>
      <span className="mr-3 text-2xl">{getFileIcon(attachment.fileType)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
      </div>
      <a
        href={attachment.url}
        download={attachment.fileName}
        className="ml-2 text-blue-500 hover:text-blue-700"
      >
        <FileDown size={20} />
      </a>
    </div>
  );
};
