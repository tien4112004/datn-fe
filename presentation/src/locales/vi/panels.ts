export default {
  // Bảng điều khiển bên
  panels: {
    // Bảng chọn
    select: {
      title: 'Đã chọn ({active}/{total})',
      showAll: 'Hiện tất cả',
      hideAll: 'Ẩn tất cả',
      groupTitle: 'Nhóm',
      emptyState: 'Trang này không có nội dung',
    },

    // Tìm kiếm & Thay thế
    search: {
      find: 'Tìm',
      replace: 'Thay thế',
      replaceAll: 'Thay thế tất cả',
      ignoreCase: 'Không phân biệt chữ hoa/thường',
      previous: 'Trước',
      next: 'Tiếp theo',
      search: 'Tìm kiếm',
    },

    // Bảng ghi chú
    notes: {
      title: 'Ghi chú cho Trang chiếu {slide}',
      reply: 'Trả lời',
      delete: 'Xóa',
      replyPlaceholder: 'Nhập nội dung trả lời',
      noNotes: 'Không có ghi chú cho trang này',
      notePlaceholder: 'Nhập ghi chú (cho {target})',
      selectedElement: 'thành phần đã chọn',
      currentSlide: 'trang chiếu hiện tại',
      clearTooltip: 'Xóa tất cả ghi chú cho trang này',
      addNote: 'Thêm ghi chú',
      testUser: 'Người dùng thử nghiệm',
    },

    // Bảng đánh dấu
    markup: {
      title: 'Ghi chú loại trang chiếu',
      currentPageType: 'Loại trang hiện tại:',
      currentTextType: 'Loại văn bản hiện tại:',
      currentImageType: 'Loại hình ảnh hiện tại:',
      placeholder: 'Chọn hình ảnh, văn bản, hoặc hình có chứa văn bản để gắn loại',
      unmarkedType: 'Chưa gắn loại',
      layoutTypes: {
        title: 'Tiêu đề',
        list: 'Danh sách',
        labeledList: 'Danh sách có nhãn',
        twoColumn: 'Hai cột',
        twoColumnWithImage: 'Hai cột có hình ảnh',
        mainImage: 'Hình ảnh chính',
        tableOfContents: 'Mục lục',
        timeline: 'Dòng thời gian',
        pyramid: 'Kim tự tháp',
      },
      textTypes: {
        title: 'Tiêu đề',
        subtitle: 'Phụ đề',
        content: 'Nội dung',
        listItem: 'Mục danh sách',
        listItemTitle: 'Tiêu đề mục danh sách',
        notes: 'Ghi chú',
        header: 'Đầu trang',
        footer: 'Chân trang',
        sectionNumber: 'Số phần',
        itemNumber: 'Số thứ tự mục',
      },
      imageTypes: {
        pageIllustration: 'Minh họa cho trang',
        itemIllustration: 'Minh họa cho mục',
        backgroundImage: 'Hình nền',
      },
    },

    // Bảng thư viện hình ảnh
    imageLibrary: {
      title: 'Thư viện hình ảnh (từ pexels.com)',
      searchPlaceholder: 'Tìm kiếm hình ảnh',
      loading: 'Đang tải...',
      insert: 'Chèn',
      orientations: {
        all: 'Tất cả',
        landscape: 'Ngang',
        portrait: 'Dọc',
        square: 'Vuông',
      },
      defaultSearch: 'phong cảnh',
      errorNoQuery: 'Vui lòng nhập từ khóa tìm kiếm',
    },
  },
};
