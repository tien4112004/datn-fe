// Constants for image validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:'];
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

/**
 * Validates image file before upload
 * Checks file size, MIME type, and dimensions
 */
const validateImageFile = async (file: File): Promise<void> => {
  // Validate file size
  if (file.size === 0) {
    throw new Error('File is empty');
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${sizeMB} MB) exceeds the maximum allowed size of 5 MB`);
  }

  // Validate MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');
  }

  // Validate file extension as additional check
  const hasValidExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  if (!hasValidExtension) {
    throw new Error('Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .webp');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file first
    await validateImageFile(file);

    // Create object URL for dimension check
    const objectUrl = URL.createObjectURL(file);

    try {
      // Validate dimensions
      const dimensions = await getImageDimensions(objectUrl);
      URL.revokeObjectURL(objectUrl);

      if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
        throw new Error(
          `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed (${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height})`
        );
      }

      // Upload to server using API
      const { getImageApiService } = await import('@/features/image/api');
      const imageService = getImageApiService();
      const imageUrl = await imageService.uploadImage(file);

      return imageUrl;
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow data URLs (but not SVG which can contain scripts)
  if (url.startsWith('data:image/')) {
    return !url.startsWith('data:image/svg');
  }

  try {
    const parsed = new URL(url);

    // Only allow safe protocols
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return false;
    }

    // Check file extension (no SVG)
    return ALLOWED_EXTENSIONS.test(parsed.pathname);
  } catch {
    return false;
  }
};

export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
};
