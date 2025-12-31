// Only tabs with backend support are included
// Removed: 'schedule' - no backend endpoints found
// Restored: 'feed' (posts), 'lessons' - backend support confirmed in feat/datn-xxx-cms branch
export type ClassTabs = 'overview' | 'feed' | 'students' | 'lessons' | 'settings';

export type ClassesViewMode = 'grid' | 'list';
