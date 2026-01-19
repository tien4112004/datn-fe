/**
 * Converts zero-based index to lowercase letter (a-z)
 * @param index - Index from 0-25
 * @returns Lowercase letter ('a' through 'z')
 */
export function indexToLetter(index: number): string {
  if (index < 0 || index > 25) {
    throw new Error(`Index out of range: ${index}. Must be 0-25.`);
  }
  return String.fromCharCode(97 + index); // 97 = 'a'
}
