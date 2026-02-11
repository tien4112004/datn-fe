export const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'],
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_ATTACHMENTS = 10;

export type MediaCategory = keyof typeof ALLOWED_EXTENSIONS;

export interface ValidationResult {
  valid: boolean;
  error?: string | 'invalid_extension' | 'file_too_large' | 'max_attachments';
  errorType?: 'invalid_extension' | 'file_too_large' | 'max_attachments';
  errorData?: Record<string, any>;
}

/**
 * Get all allowed extensions as a flat array
 */
export function getAllAllowedExtensions(): string[] {
  return Object.values(ALLOWED_EXTENSIONS).flat();
}

/**
 * Get the file extension from a filename (lowercase, without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Check if a file extension is allowed
 */
export function isValidFileExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  if (!extension) return false;
  return getAllAllowedExtensions().includes(extension);
}

/**
 * Check if a file size is within the allowed limit
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Validate a single file and return a ValidationResult with structured data
 */
export function validateAttachment(file: File, currentCount = 0): ValidationResult {
  const extension = getFileExtension(file.name);

  if (!isValidFileExtension(file.name)) {
    return {
      valid: false,
      error: 'invalid_extension',
      errorType: 'invalid_extension',
      errorData: { extension },
    };
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: 'file_too_large',
      errorType: 'file_too_large',
      errorData: {
        maxSizeMB: Math.round(MAX_FILE_SIZE / (1024 * 1024)),
        actualSizeMB: Math.round(file.size / (1024 * 1024)),
      },
    };
  }

  if (currentCount >= MAX_ATTACHMENTS) {
    return {
      valid: false,
      error: 'max_attachments',
      errorType: 'max_attachments',
      errorData: { max: MAX_ATTACHMENTS },
    };
  }

  return { valid: true };
}

/**
 * Get the media category for a file
 */
export function getMediaCategory(filename: string): MediaCategory | null {
  const extension = getFileExtension(filename);
  if (!extension) return null;

  for (const [category, extensions] of Object.entries(ALLOWED_EXTENSIONS)) {
    if ((extensions as readonly string[]).includes(extension)) {
      return category as MediaCategory;
    }
  }
  return null;
}

/**
 * Generate the accept attribute string for file input
 */
export function getAcceptString(): string {
  return getAllAllowedExtensions()
    .map((ext) => `.${ext}`)
    .join(',');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
