// Mock implementation for demo (real would upload to server)
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url) || url.startsWith('data:image/');
  } catch {
    return url.startsWith('data:image/');
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
