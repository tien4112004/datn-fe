/**
 * Comments feature translations
 * Used for comment drawer and comment-related functionality
 */
export default {
  drawer: {
    title: 'Comments',
    titleWithCount: 'Comments ({{count}})',
  },
  form: {
    placeholder: 'Write a comment...',
    submit: 'Comment',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    submitting: 'Submitting...',
    charactersRemaining: '{{count}} characters remaining',
  },
  actions: {
    edit: 'Edit',
    delete: 'Delete',
    edited: '(edited)',
  },
  confirmations: {
    deleteTitle: 'Delete comment',
    deleteComment: 'Are you sure you want to delete this comment? This action cannot be undone.',
    deleting: 'Deleting...',
  },
  messages: {
    loadFailed: 'Failed to load comments',
    addSuccess: 'Comment added successfully',
    addFailed: 'Failed to add comment',
    updateSuccess: 'Comment updated successfully',
    updateFailed: 'Failed to update comment',
    deleteSuccess: 'Comment deleted successfully',
    deleteFailed: 'Failed to delete comment',
  },
  empty: {
    title: 'No comments yet',
    description: 'Be the first to comment!',
  },
  loading: 'Loading comments...',
};
