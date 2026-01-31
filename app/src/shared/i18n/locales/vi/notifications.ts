/**
 * Notifications page translations
 */
export default {
  title: 'Thông báo',
  status: {
    title: 'Trạng thái thông báo',
    description: 'Quản lý cách bạn nhận thông báo về hoạt động lớp học và bài tập.',
    notSupported: {
      title: 'Không được hỗ trợ',
      description:
        'Trình duyệt của bạn không hỗ trợ thông báo đẩy. Vui lòng sử dụng trình duyệt hiện đại như Chrome, Firefox hoặc Edge.',
    },
    blocked: {
      title: 'Thông báo bị chặn',
      description:
        'Chúng tôi không thể gửi thông báo cho bạn vì thông báo đã bị chặn trong cài đặt trình duyệt.',
      howToUnblock: 'Cách bỏ chặn:',
      step1: 'Nhấp vào <bold>biểu tượng Khóa</bold> hoặc <bold>biểu tượng Cài đặt</bold> trên thanh địa chỉ',
      step2: 'Tìm "Thông báo" hoặc "Quyền"',
      step3: 'Thay đổi cài đặt từ "Chặn" thành "Cho phép" hoặc "Đặt lại"',
      step4: 'Tải lại trang này',
    },
    active: {
      title: 'Đang hoạt động',
      description: 'Bạn đã sẵn sàng! Bạn sẽ nhận được thông báo cho các bài đăng và cập nhật mới.',
    },
    enable: {
      title: 'Bật thông báo',
      description: 'Nhận thông báo tức thì khi giáo viên đăng thông báo.',
      button: 'Bật ngay',
    },
  },
  list: {
    title: 'Thông báo gần đây',
    totalNotifications: '{{count}} thông báo',
    unreadCount: '({{count}} chưa đọc)',
    markAllAsRead: 'Đánh dấu tất cả đã đọc',
    loading: 'Đang tải thông báo...',
    empty: 'Chưa có thông báo nào',
  },
  pagination: {
    previous: 'Trước',
    next: 'Tiếp',
    pageOf: 'Trang {{current}} / {{total}}',
  },
};
