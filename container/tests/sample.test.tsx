import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock component for testing
const TestComponent = () => {
  return <div>Hello Container App!</div>;
};

describe('Sample Test', () => {
  it('renders test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Container App!')).toBeInTheDocument();
  });

  it('basic math test', () => {
    expect(2 + 2).toBe(4);
  });
});
