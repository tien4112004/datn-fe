export default {
  header: {
    title: 'Dashboard',
    welcome: "Welcome back! Here's what's happening today.",
  },
  quickNav: {
    title: 'Quick Actions',
    assignment: 'Create Assignment',
    image: 'Generate Image',
    mindmap: 'Generate Mindmap',
    presentation: 'Generate Presentation',
    questionsBank: 'Questions Bank',
  },
  recentDocuments: {
    title: 'Recent Documents',
    empty: 'No recent documents',
    edited: 'Edited',
    noPreview: 'No preview',
  },
  myClasses: {
    title: 'My Classes',
    addClass: 'Add Class',
    table: {
      columns: {
        className: 'Class Name',
        status: 'Status',
        createdAt: 'Created At',
      },
      actions: {
        manageStudents: 'Manage Students',
      },
      empty: 'No classes found',
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
    },
    loading: 'Loading...',
  },
  calendar: {
    title: 'Calendar',
    nextUp: 'Next Up',
    today: 'Today',
    weekdays: {
      sunday: 'Sun',
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
    },
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
    noEvents: 'No events scheduled',
    loading: 'Loading events...',
  },
  pendingGrading: {
    title: 'Pending Grading',
    description: 'Review and grade student submissions',
    empty: {
      title: 'All Caught Up! 🎉',
      description: 'No pending submissions to grade',
    },
    urgency: {
      urgent: 'Urgent',
      attention: 'Attention',
      normal: 'Normal',
    },
    daysAgo: '{{count}} days ago',
    autoGraded: 'Auto-graded: {{score}}/{{max}}',
  },
  classesOverview: {
    title: 'Classes Overview',
    description: {
      atRisk: '{{count}} students need attention across your classes',
      allGood: 'All students are performing well',
    },
    empty: {
      title: 'No Classes Yet',
      description: 'Create your first class to get started',
    },
    students: '{{count}} students',
    atRisk: '{{count}} at risk',
    atRiskStudents: 'At-Risk Students:',
    missedLate: '{{missed}} missed, {{late}} late',
  },
  banner: {
    title: 'Generate Teaching Resources with AI',
    description: 'Create quizzes, worksheets, and lesson plans instantly using AI',
    action: 'Generate Now',
  },
  metrics: {
    totalClasses: {
      title: 'Total Classes',
      subtitle: '{{count}} students total',
    },
    pendingGrading: {
      title: 'Pending Grading',
      subtitle: {
        urgent: '{{count}} need attention',
        allGood: 'All caught up',
      },
    },
    totalStudents: {
      title: 'Total Students',
      subtitle: 'Across {{count}} classes',
    },
  },
};
