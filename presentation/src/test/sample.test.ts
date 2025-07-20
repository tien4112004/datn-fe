import { describe, it, expect } from 'vitest';

// Simple utility function for testing
function greet(name: string) {
  return `Hello ${name}!`;
}

describe('Sample Test', () => {
  it('greets correctly', () => {
    expect(greet('Presentation App')).toBe('Hello Presentation App!');
  });

  it('basic math test', () => {
    expect(2 + 2).toBe(4);
  });

  it('array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
