import React from 'react';
import type { ExtendedSlideTheme } from '../../types/slide';

interface ThemePreviewCardProps {
  theme: ExtendedSlideTheme;
  isSelected?: boolean;
  onClick?: () => void;
  title?: string;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  theme,
  isSelected = false,
  onClick,
  title = 'Theme Preview',
}) => {
  // Mini slide dimensions (16:9 aspect ratio scaled down)
  const slideWidth = 200;
  const slideHeight = 112;

  // Calculate scaled dimensions for elements
  const titleHeight = slideHeight * 0.35;
  const contentAreaHeight = slideHeight * 0.35;
  const margin = slideWidth * 0.08;

  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-lg border-2 shadow-sm transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{
        width: slideWidth,
        height: slideHeight,
        backgroundColor: theme.backgroundColor,
      }}
      onClick={onClick}
    >
      {/* Theme title */}
      {title && (
        <div
          className="absolute flex items-center"
          style={{
            left: margin,
            top: margin,
            width: slideWidth - margin * 2,
            height: titleHeight,
            color: theme.titleFontColor || theme.fontColor,
            fontFamily: theme.titleFontName || theme.fontName,
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          {title}
        </div>
      )}

      {/* Body text */}
      <div
        className="absolute flex items-center"
        style={{
          left: margin,
          top: margin + titleHeight - 8,
          width: slideWidth - margin * 2,
          height: contentAreaHeight,
          color: theme.fontColor,
          fontFamily: theme.fontName,
          fontSize: '14px',
        }}
      >
        Body
      </div>

      {/* Color palette strip */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
        {theme.themeColors.slice(0, 5).map((color, index) => (
          <div
            key={index}
            className="flex-1 rounded-sm"
            style={{
              height: '8px',
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ThemePreviewCard;
