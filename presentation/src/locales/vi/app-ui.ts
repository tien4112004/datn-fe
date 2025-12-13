export default {
  // ===============================
  // ỨNG DỤNG CHÍNH
  // ===============================
  app: {
    title: 'PPTist',
    subtitle: 'Công cụ trình bày trực tuyến',
    initializing: 'Đang khởi tạo dữ liệu, vui lòng chờ...',
  },

  loading: {
    generatingPresentation: 'Đang tạo bài thuyết trình, vui lòng chờ...',
  },

  // ===============================
  // GIAO DIỆN NGƯỜI DÙNG
  // ===============================
  ui: {
    // Thành phần chung
    components: {
      colorPicker: {
        recentlyUsed: 'Đã dùng gần đây:',
        eyedropperInitializationFailed: 'Khởi tạo công cụ chọn màu thất bại',
      },
      select: {
        search: 'Tìm kiếm',
      },
      contextmenu: {
        paste: 'Dán',
      },
    },

    // Hành động chung
    actions: {
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      delete: 'Xóa',
      copy: 'Sao chép',
      paste: 'Dán',
      cut: 'Cắt',
      undo: 'Hoàn tác',
      redo: 'Làm lại',
      selectAll: 'Chọn tất cả',
      search: 'Tìm kiếm',
      preview: 'Xem trước',
      close: 'Đóng',
      back: 'Quay lại',
      more: 'Thêm',
      hide: 'Ẩn',
      show: 'Hiện tất cả',
      set: 'Thiết lập',
      apply: 'Áp dụng',
      reset: 'Đặt lại',
      remove: 'Gỡ bỏ',
    },

    // Nhập liệu & Biểu mẫu
    inputs: {
      enterHyperlink: 'Nhập liên kết',
      enterWebAddress: 'Nhập địa chỉ liên kết trang web',
      searchFont: 'Tìm phông chữ',
      searchFontSize: '',
      placeholder: 'Nội dung mẫu',
      invalidWebLink: 'Địa chỉ liên kết không hợp lệ',
    },

    // Bố cục & Điều hướng
    layout: {
      ruler: 'Thước đo',
      gridLines: 'Đường lưới',
      none: 'Không có',
      small: 'Nhỏ',
      medium: 'Trung bình',
      large: 'Lớn',
      fitToScreen: 'Vừa với màn hình',
    },

    // Giao diện di động
    mobile: {
      player: {
        exitPlay: 'Thoát chế độ trình chiếu',
      },
      preview: {
        edit: 'Chỉnh sửa',
        play: 'Trình chiếu',
      },
    },
  },
};
