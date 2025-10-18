export default {
  // Thanh công cụ & Công cụ
  toolbar: {
    // Công cụ chính
    tools: {
      insertText: 'Chèn văn bản',
      horizontalTextBox: 'Hộp văn bản ngang',
      verticalTextBox: 'Hộp văn bản dọc',
      insertShape: 'Chèn hình dạng',
      freehandDrawing: 'Vẽ tự do',
      insertImage: 'Chèn hình ảnh',
      insertLine: 'Chèn đường thẳng',
      insertChart: 'Chèn biểu đồ',
      insertTable: 'Chèn bảng',
      insertFormula: 'Chèn công thức',
      insertAudioVideo: 'Chèn âm thanh/Video',
    },

    // Bảng công cụ
    panels: {
      annotationPanel: 'Bảng chú thích',
      selectionPane: 'Ngăn chọn đối tượng',
      findAndReplace: 'Tìm và thay thế',
    },

    // Danh mục
    categories: {
      style: 'Kiểu dáng',
      symbol: 'Ký hiệu',
      position: 'Vị trí',
      animation: 'Hiệu ứng',
      design: 'Thiết kế',
      template: 'Mẫu slide',
      transition: 'Chuyển trang',
      styleMulti: 'Kiểu dáng (Chọn nhiều)',
      positionMulti: 'Vị trí (Chọn nhiều)',
    },

    // Bảng chọn mẫu slide
    slideTemplate: {
      title: 'Chuyển đổi mẫu',
      description: 'Chọn một kiểu bố cục khác cho slide này trong khi vẫn giữ nguyên nội dung.',
      noTemplatesAvailable: 'Không có mẫu nào khả dụng cho slide này.',
      onlyForAIGenerated: 'Chuyển đổi mẫu chỉ khả dụng cho các slide được tạo bởi AI.',
      active: 'Đang dùng',
      confirmButton: 'Dùng mẫu này & Bắt đầu chỉnh sửa',
      customizeParameters: 'Tùy chỉnh bố cục',
      resetToDefaults: 'Đặt lại mặc định',
    },

    // Công cụ biểu đồ
    charts: {
      type: 'Loại biểu đồ',

      pool: {
        bar: 'Hàng',
        column: 'Cột',
        line: 'Đường',
        area: 'Vùng',
        scatter: 'Phân tán',
        pie: 'Tròn',
        ring: 'Vòng',
        radar: 'Radar',
      },

      editor: {
        cancel: 'Hủy',
        clearData: 'Xóa dữ liệu',
        confirm: 'Xác nhận',
        clickToChange: 'Nhấp để thay đổi',
      },
    },

    // Công cụ phương tiện
    media: {
      input: {
        videoPlaceholder: 'Vui lòng nhập URL video, ví dụ: https://xxx.mp4',
        audioPlaceholder: 'Vui lòng nhập URL âm thanh, ví dụ: https://xxx.mp3',
        video: 'Video',
        audio: 'Âm thanh',
        invalidVideoUrl: 'Vui lòng nhập URL video hợp lệ trước',
        invalidAudioUrl: 'Vui lòng nhập URL âm thanh hợp lệ trước',
      },
    },

    // Công cụ bảng
    table: {
      generator: {
        custom: 'Tùy chỉnh',
        rows: 'Số hàng:',
        columns: 'Số cột:',
        invalidRange: 'Số hàng/cột phải nằm trong khoảng 1-20!',
      },
    },
  },
};
