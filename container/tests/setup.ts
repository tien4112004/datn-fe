import '@testing-library/jest-dom';
import '@testing-library/user-event';
import { vi } from 'vitest';

// Mock window.scrollTo for jsdom compatibility
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Add missing DOM API polyfills for Radix UI components
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Add ResizeObserver mock for Radix components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Vue Remote modules for module federation
const mockMount = vi.fn();

vi.mock('/src/features/presentation/components/remote/module', () => {
  return {
    moduleMap: {
      editor: vi.fn().mockResolvedValue({ mount: mockMount }),
      thumbnail: vi.fn().mockResolvedValue({ mount: mockMount }),
    },
    moduleMethodMap: {
      convertToSlide: vi.fn().mockResolvedValue({ default: vi.fn().mockResolvedValue({ success: true }) }),
      method: vi
        .fn()
        .mockResolvedValue({
          default: {
            getThemes: vi.fn().mockReturnValue({ default: { id: 'default', name: 'Default Theme' } }),
          },
        }),
    },
  };
});
