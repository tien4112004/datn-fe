/**
 * Utilities for handling post URL references in comments
 * Detects and parses post URLs like: http://domain.com/classes/abc/posts/123
 */

export interface PostReference {
  postId: string;
  classId: string;
  url: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Regex pattern for detecting post URLs
 * Matches: /classes/{classId}/posts/{postId} or /student/classes/{classId}/posts/{postId}
 */
const POST_URL_PATTERN = /https?:\/\/[^\s]+\/(student\/)?classes\/([a-zA-Z0-9-]+)\/posts\/([a-zA-Z0-9-]+)/g;
const RELATIVE_POST_URL_PATTERN = /\/(student\/)?classes\/([a-zA-Z0-9-]+)\/posts\/([a-zA-Z0-9-]+)/g;

/**
 * Parse post URL references from comment text
 * Returns array of references with their positions
 */
export function parsePostReferences(text: string): PostReference[] {
  const references: PostReference[] = [];

  // Find absolute URL references
  let match: RegExpExecArray | null;
  const absoluteRegex = new RegExp(POST_URL_PATTERN);
  while ((match = absoluteRegex.exec(text)) !== null) {
    references.push({
      postId: match[3],
      classId: match[2],
      url: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Find relative URL references
  const relativeRegex = new RegExp(RELATIVE_POST_URL_PATTERN);
  while ((match = relativeRegex.exec(text)) !== null) {
    // Skip if this position was already matched by absolute URL
    const currentMatch = match; // Store match to avoid null check issues
    const alreadyMatched = references.some(
      (ref) => currentMatch.index >= ref.startIndex && currentMatch.index < ref.endIndex
    );
    if (!alreadyMatched) {
      references.push({
        postId: currentMatch[3],
        classId: currentMatch[2],
        url: currentMatch[0],
        startIndex: currentMatch.index,
        endIndex: currentMatch.index + currentMatch[0].length,
      });
    }
  }

  // Sort by position
  references.sort((a, b) => a.startIndex - b.startIndex);

  return references;
}

/**
 * Check if a URL is a post URL
 */
export function isPostUrl(url: string): boolean {
  return POST_URL_PATTERN.test(url) || RELATIVE_POST_URL_PATTERN.test(url);
}

/**
 * Extract post ID and class ID from a post URL
 */
export function extractPostInfo(
  url: string
): { postId: string; classId: string; isStudentMode: boolean } | null {
  const absoluteMatch = url.match(POST_URL_PATTERN);
  if (absoluteMatch) {
    return {
      postId: absoluteMatch[3],
      classId: absoluteMatch[2],
      isStudentMode: !!absoluteMatch[1],
    };
  }

  const relativeMatch = url.match(RELATIVE_POST_URL_PATTERN);
  if (relativeMatch) {
    return {
      postId: relativeMatch[3],
      classId: relativeMatch[2],
      isStudentMode: !!relativeMatch[1],
    };
  }

  return null;
}
