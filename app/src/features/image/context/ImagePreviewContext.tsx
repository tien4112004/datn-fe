import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ImageData } from '../types/service';

interface ImagePreviewContextType {
  isOpen: boolean;
  selectedImage: ImageData | null;
  openPreview: (image: ImageData) => void;
  closePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(undefined);

export const ImagePreviewProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const openPreview = (image: ImageData) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  return (
    <ImagePreviewContext.Provider value={{ isOpen, selectedImage, openPreview, closePreview }}>
      {children}
    </ImagePreviewContext.Provider>
  );
};

export const useImagePreview = () => {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error('useImagePreview must be used within ImagePreviewProvider');
  }
  return context;
};
