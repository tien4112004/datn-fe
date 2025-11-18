export default {
  toolbar: {
    title: 'Công cụ',
    sections: {
      nodeOperations: 'Thao tác nút',
      history: 'Lịch sử',
      layout: 'Bố cục',
      utilities: 'Tiện ích',
    },
    actions: {
      addNode: 'Thêm nút',
      deleteSelected: 'Xóa nút đã chọn',
      undo: 'Hoàn tác',
      redo: 'Làm lại',
      applyLayout: 'Áp dụng bố cục',
      logData: 'Ghi nhật ký dữ liệu',
    },
    layout: {
      forceAutoLayout: 'Bật bố cục tự động',
      direction: 'Hướng',
      horizontal: 'Ngang',
      vertical: 'Dọc',
      none: 'Không',
    },
    tooltips: {
      addNode: 'Thêm nút mới',
      deleteSelected: 'Xóa các nút đã chọn',
      undo: 'Hoàn tác (Ctrl+Z)',
      redo: 'Làm lại (Ctrl+Y)',
      applyLayout: 'Áp dụng bố cục',
      logData: 'Ghi nhật ký nút và cạnh',
    },
  },
  export: {
    title: 'Xuất Mindmap',
    formats: {
      png: 'Ảnh PNG',
      jpg: 'Ảnh JPG',
      svg: 'Vector SVG',
      pdf: 'Tài liệu PDF',
    },
    common: {
      backgroundColor: 'Màu nền',
      white: 'Trắng',
      transparent: 'Trong suốt',
      dimensions: 'Kích thước',
      skipFonts: 'Bỏ qua font web',
      export: 'Xuất',
      cancel: 'Hủy',
      exporting: 'Đang xuất...',
    },
    image: {
      quality: 'Chất lượng',
      width: 'Chiều rộng',
      height: 'Chiều cao',
    },
    svg: {
      strokeColor: 'Màu viền',
      includeBackground: 'Bao gồm nền',
    },
    pdf: {
      orientation: 'Hướng',
      portrait: 'Dọc',
      landscape: 'Ngang',
      paperSize: 'Kích thước giấy',
    },
  },
};
