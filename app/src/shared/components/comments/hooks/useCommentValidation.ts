export interface CommentValidationOptions {
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

export function useCommentValidation(options: CommentValidationOptions = {}) {
  const { maxLength = 5000, minLength = 1, required = true } = options;

  const validate = (content: string): { isValid: boolean; error?: string } => {
    if (required && !content.trim()) {
      return { isValid: false, error: 'Comment cannot be empty' };
    }

    if (content.length > maxLength) {
      return { isValid: false, error: `Comment exceeds ${maxLength} characters` };
    }

    if (content.trim().length < minLength) {
      return { isValid: false, error: `Comment must be at least ${minLength} characters` };
    }

    return { isValid: true };
  };

  return { validate };
}
