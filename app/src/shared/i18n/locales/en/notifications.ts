/**
 * Notifications page translations
 */
export default {
  title: 'Notifications',
  status: {
    title: 'Notification Status',
    description: 'Manage how you receive updates about class activities and assignments.',
    notSupported: {
      title: 'Not Supported',
      description:
        'Your browser does not support push notifications. Please try using a modern browser like Chrome, Firefox, or Edge.',
    },
    blocked: {
      title: 'Notifications are Blocked',
      description: 'We cannot send you updates because notifications are blocked in your browser settings.',
      howToUnblock: 'How to unblock:',
      step1: 'Click the <bold>Lock icon</bold> or <bold>Settings icon</bold> in your address bar URL',
      step2: 'Find "Notifications" or "Permissions"',
      step3: 'Change the setting from "Block" to "Allow" or "Reset"',
      step4: 'Reload this page',
    },
    active: {
      title: 'Active',
      description: 'You are all set! You will receive notifications for new posts and updates.',
    },
    enable: {
      title: 'Enable Notifications',
      description: 'Get instant updates when teachers post announcements.',
      button: 'Enable Now',
    },
  },
  list: {
    title: 'Recent Notifications',
    totalNotifications: '{{count}} total notifications',
    unreadCount: '({{count}} unread)',
    markAllAsRead: 'Mark all as read',
    loading: 'Loading notifications...',
    empty: 'No notifications yet',
  },
  dropdown: {
    title: 'Notifications',
    markAllAsRead: 'Mark all read',
    empty: 'No notifications yet',
    viewAll: 'View all notifications',
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {{current}} of {{total}}',
  },
};
