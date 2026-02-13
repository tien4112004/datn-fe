export default {
  header: {
    title: 'Bảng Điều Khiển',
    welcome: 'Chào mừng trở lại! Đây là những gì đang diễn ra hôm nay.',
  },
  quickNav: {
    title: 'Thao Tác Nhanh',
    assignment: 'Tạo Bài Tập',
    image: 'Tạo Hình Ảnh',
    mindmap: 'Tạo Sơ Đồ Tư Duy',
    presentation: 'Tạo Bài Thuyết Trình',
    questionsBank: 'Ngân Hàng Câu Hỏi',
  },
  recentDocuments: {
    title: 'Tài Liệu Gần Đây',
    empty: 'Không có tài liệu gần đây',
    edited: 'Đã chỉnh sửa',
    noPreview: 'Không có xem trước',
  },
  myClasses: {
    title: 'Lớp Học Của Tôi',
    addClass: 'Thêm Lớp Học',
    table: {
      columns: {
        className: 'Tên Lớp',
        status: 'Trạng Thái',
        createdAt: 'Ngày Tạo',
      },
      actions: {
        manageStudents: 'Quản Lý Học Sinh',
      },
      empty: 'Không tìm thấy lớp học',
      status: {
        active: 'Hoạt Động',
        inactive: 'Không Hoạt Động',
      },
    },
    loading: 'Đang tải...',
  },
  calendar: {
    title: 'Lịch',
    nextUp: 'Sắp Tới',
    today: 'Hôm Nay',
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
    title: 'Chấm Điểm Đang Chờ',
    description: 'Xem xét và chấm điểm bài làm của học sinh',
    empty: {
      title: 'Đã Hoàn Thành! 🎉',
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
    title: 'Tổng Quan Lớp Học',
    description: {
      atRisk: '{{count}} học sinh cần chú ý trong các lớp học của bạn',
      allGood: 'Tất cả học sinh đều đang học tốt',
    },
    empty: {
      title: 'Chưa Có Lớp Học',
      description: 'Tạo lớp học đầu tiên của bạn để bắt đầu',
    },
    students: '{{count}} học sinh',
    atRisk: '{{count}} có nguy cơ',
    atRiskStudents: 'Học Sinh Có Nguy Cơ:',
    missedLate: '{{missed}} bỏ lỡ, {{late}} muộn',
  },
  banner: {
    title: 'Tạo Tài Liệu Giảng Dạy Bằng AI',
    description: 'Tạo câu đố, bảng tính và giáo án ngay lập tức bằng AI',
    action: 'Tạo Ngay',
  },
  metrics: {
    totalClasses: {
      title: 'Tổng Số Lớp',
      subtitle: 'Tổng cộng {{count}} học sinh',
    },
    pendingGrading: {
      title: 'Chấm Điểm Đang Chờ',
      subtitle: {
        urgent: '{{count}} cần chú ý',
        allGood: 'Đã hoàn thành',
      },
    },
    totalStudents: {
      title: 'Tổng Số Học Sinh',
      subtitle: 'Trong {{count}} lớp',
    },
  },
};
