import '@testing-library/jest-dom';
import '@testing-library/user-event';

// Mock window.scrollTo for jsdom compatibility
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});
