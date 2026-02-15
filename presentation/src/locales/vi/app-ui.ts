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
  // TRÌNH CHỈNH SỬA
  // ===============================
  editor: {
    templatePreview: {
      title: 'Chế độ xem trước mẫu',
      confirmCurrent: 'Xác nhận & Bắt đầu chỉnh sửa',
      confirmAll: 'Xác nhận tất cả slide',
      confirmAllWarning: 'Nhấn lại để xác nhận tất cả',
      successSingle: 'Đã xác nhận mẫu! Bạn có thể chỉnh sửa slide của mình.',
      successMultiple: 'Đã xác nhận {count} slide! Tất cả slide đã có thể chỉnh sửa.',
      infoButton: 'Tìm hiểu thêm về chế độ này',
      dialog: {
        title: 'Hiểu về Chế độ Xem Trước Mẫu',
        intro:
          'Bạn đang ở Chế độ Xem Trước Mẫu. Chế độ này cho phép bạn khám phá và chọn bố cục trước khi chỉnh sửa.',
        currentMode: 'Chế độ hiện tại',
        canDo: 'Những gì bạn có thể làm',
        cannotDo: 'Những gì bạn không thể làm',
        available: 'Tính năng có sẵn',
        howToUnlock: 'Để mở khóa khả năng chỉnh sửa đầy đủ, hãy xác nhận lựa chọn mẫu của bạn',
        previewMode: {
          title: 'Chế độ Xem Trước Mẫu',
          features: {
            browseTemplates: 'Duyệt và xem trước các bố cục slide khác nhau',
            switchLayouts: 'Chuyển đổi giữa các biến thể mẫu',
            navigateSlides: 'Di chuyển qua bài thuyết trình của bạn',
            previewContent: 'Xem nội dung của bạn trông như thế nào trong các bố cục khác nhau',
          },
          limitations: {
            editText: 'Chỉnh sửa hoặc thay đổi nội dung văn bản',
            moveElements: 'Di chuyển, thay đổi kích thước hoặc sắp xếp lại các phần tử',
            addContent: 'Thêm hộp văn bản, hình dạng hoặc hình ảnh mới',
            customizeStyles: 'Thay đổi màu sắc, phông chữ hoặc kiểu dáng',
            deleteContent: 'Xóa hoặc loại bỏ nội dung hiện có',
            slideModification: 'Sửa đổi slide bằng AI',
          },
        },
        editingMode: {
          title: 'Chế độ Chỉnh Sửa Bình Thường',
          features: {
            fullEditing: 'Chỉnh sửa tất cả văn bản và nội dung một cách tự do',
            moveResize: 'Di chuyển và thay đổi kích thước bất kỳ phần tử nào',
            addElements: 'Thêm văn bản, hình dạng, hình ảnh và nhiều hơn nữa',
            customizeDesign: 'Tùy chỉnh màu sắc, phông chữ và kiểu dáng',
            slideEditing: 'Sửa đổi cấu trúc slide, thêm/xóa slide',
            elementEditing: 'Chỉnh sửa các phần tử riêng lẻ với toàn bộ kiểm soát',
            aiEditing: 'Sử dụng AI để tinh chỉnh nội dung, tạo hình ảnh và cải thiện bố cục',
            fullToolbar: 'Truy cập tất cả các công cụ và tính năng chỉnh sửa',
            deleteModify: 'Xóa, sao chép hoặc sửa đổi bất cứ thứ gì',
          },
        },
      },
    },
    remarks: {
      title: 'Ghi chú slide',
      clickToEdit: 'Nhấn để chỉnh sửa ghi chú',
      clickToAdd: 'Nhấn để thêm ghi chú',
    },
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
