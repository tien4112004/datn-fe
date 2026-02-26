export default {
  header: {
    title: 'Bảng điều khiển',
    welcome: 'Chào mừng trở lại! Đây là những gì đang diễn ra hôm nay.',
  },
  quickNav: {
    title: 'Thao tác nhanh',
    assignment: 'Tạo bài tập',
    image: 'Tạo hình ảnh',
    mindmap: 'Tạo sơ đồ tư duy',
    presentation: 'Tạo bài thuyết trình',
    questionsBank: 'Ngân hàng câu hỏi',
  },
  recentDocuments: {
    title: 'Tài liệu gần đây',
    empty: {
      title: 'Chưa có tài liệu nào',
      subtitle: 'Các tài liệu bạn chỉnh sửa gần đây sẽ xuất hiện ở đây',
    },
    edited: 'Đã chỉnh sửa',
    noPreview: 'Không có xem trước',
  },
  myClasses: {
    title: 'Lớp học của tôi',
    addClass: 'Thêm lớp học',
    table: {
      columns: {
        className: 'Tên lớp',
        status: 'Trạng thái',
        createdAt: 'Ngày tạo',
      },
      actions: {
        manageStudents: 'Quản lý học sinh',
      },
      empty: 'Không tìm thấy lớp học',
      status: {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
      },
    },
    loading: 'Đang tải...',
  },
  calendar: {
    title: 'Lịch',
    nextUp: 'Sắp tới',
    today: 'Hôm nay',
    weekdays: {
      sunday: 'CN',
      monday: 'T2',
      tuesday: 'T3',
      wednesday: 'T4',
      thursday: 'T5',
      friday: 'T6',
      saturday: 'T7',
    },
    months: {
      january: 'Tháng Một',
      february: 'Tháng Hai',
      march: 'Tháng Ba',
      april: 'Tháng Tư',
      may: 'Tháng Năm',
      june: 'Tháng Sáu',
      july: 'Tháng Bảy',
      august: 'Tháng Tám',
      september: 'Tháng Chín',
      october: 'Tháng Mười',
      november: 'Tháng Mười Một',
      december: 'Tháng Mười Hai',
    },
    noEvents: 'Không có sự kiện nào',
    loading: 'Đang tải sự kiện...',
  },
  pendingGrading: {
    title: 'Chấm điểm đang chờ',
    description: 'Xem xét và chấm điểm bài làm của học sinh',
    empty: {
      title: 'Đã hoàn thành! 🎉',
      description: 'Không có bài nộp nào cần chấm',
    },
    urgency: {
      urgent: 'Khẩn cấp',
      attention: 'Chú ý',
      normal: 'Bình thường',
    },
    daysAgo: '{{count}} ngày trước',
    autoGraded: 'Tự động chấm: {{score}}/{{max}}',
  },
  classesOverview: {
    title: 'Tổng quan lớp học',
    description: {
      atRisk: '{{count}} học sinh cần chú ý trong các lớp học của bạn',
      allGood: 'Tất cả học sinh đều đang học tốt',
    },
    empty: {
      title: 'Chưa có lớp học',
      description: 'Tạo lớp học đầu tiên của bạn để bắt đầu',
    },
    students: '{{count}} học sinh',
    atRisk: '{{count}} có nguy cơ',
    atRiskStudents: 'Học sinh có nguy cơ:',
    missedLate: '{{missed}} bỏ lỡ, {{late}} muộn',
  },
  banner: {
    title: 'Tạo tài liệu giảng dạy bằng AI',
    description: 'Tạo câu đố, bảng tính và giáo án ngay lập tức bằng AI',
    action: 'Tạo Ngay',
  },
  metrics: {
    totalClasses: {
      title: 'Tổng số lớp',
      subtitle: 'Tổng cộng {{count}} học sinh',
    },
    pendingGrading: {
      title: 'Chấm điểm đang chờ',
      subtitle: {
        urgent: '{{count}} cần chú ý',
        allGood: 'Đã hoàn thành',
      },
    },
    totalStudents: {
      title: 'Tổng số học sinh',
      subtitle: 'Trong {{count}} lớp',
    },
  },
};
