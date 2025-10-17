export default {
  // Thiết kế Slide
  slide: {
    design: {
      canvasSize: 'Kích thước canvas:',
      confirm: 'Xác nhận',
      editThemeColors: 'Chỉnh sửa màu chủ đề',
      applyThemeToAll: 'Áp dụng chủ đề cho tất cả',
      extractThemeFromSlide: 'Trích xuất chủ đề từ slide',
      presetThemes: 'Chủ đề có sẵn',
      textAa: 'Văn bản Aa',
      set: 'Thiết lập',
      setAndApply: 'Thiết lập và áp dụng',

      themeColorsLimitWarning: 'Số lượng màu chủ đề vượt quá giới hạn, tự động chọn 6 màu đầu tiên',
      eyedropperEscHint: 'Nhấn ESC để đóng công cụ chọn màu',
      shapeCreateHint:
        'Nhấn để vẽ hình bất kỳ, đóng hình để hoàn tất, nhấn ESC hoặc chuột phải để hủy, nhấn ENTER để kết thúc sớm',

      // Nền
      background: {
        backgroundFill: 'Nền slide',
        solidFill: 'Tô màu đơn sắc',
        imageFill: 'Tô bằng hình ảnh',
        gradientFill: 'Tô chuyển sắc',
        scale: 'Thu phóng',
        tile: 'Lặp lại',
        cover: 'Phủ kín',
        linearGradient: 'Chuyển sắc tuyến tính',
        radialGradient: 'Chuyển sắc hình tròn',
        applyBackgroundToAll: 'Áp dụng nền cho tất cả',
      },

      // Tỉ lệ khung hình
      aspectRatios: {
        widescreen169: 'Màn hình rộng 16:9',
        widescreen1610: 'Màn hình rộng 16:10',
        standard43: 'Chuẩn 4:3',
        paperA: 'Giấy A3/A4',
        portraitA: 'Dọc A3/A4',
      },

      // Chủ đề
      theme: {
        mainTheme: 'Chủ đề chính',
        currentColorBlock: 'Khối màu hiện tại:',
        gradientAngle: 'Góc chuyển sắc:',
        font: 'Phông chữ:',
        fontColor: 'Màu chữ:',
        titleFont: 'Phông chữ tiêu đề:',
        titleFontColor: 'Màu chữ tiêu đề:',
        backgroundColor: 'Màu nền:',
        themeColor: 'Màu chủ đề:',
        searchFont: 'Tìm phông chữ',
      },

      // Thuộc tính kiểu dáng
      style: {
        borderStyle: 'Kiểu viền:',
        borderColor: 'Màu viền:',
        borderWidth: 'Độ dày viền:',
        horizontalShadow: 'Bóng ngang:',
        verticalShadow: 'Bóng dọc:',
        blurDistance: 'Độ mờ:',
        shadowColor: 'Màu bóng:',
      },

      // Số trang
      pageNumbers: {
        title: 'Cài đặt số trang',
        showPageNumbers: 'Hiển thị số trang',
        position: 'Vị trí số trang',
        skipTitlePage: 'Bỏ qua trang tiêu đề',
        positions: {
          topLeft: 'Trên trái',
          topCenter: 'Trên giữa',
          topRight: 'Trên phải',
          bottomLeft: 'Dưới trái',
          bottomCenter: 'Dưới giữa',
          bottomRight: 'Dưới phải',
        },
      },
    },

    // Màu chủ đề
    themeColors: {
      setting: {
        slideThemeColor: 'Màu chủ đề slide',
        chartThemeColors: 'Màu chủ đề biểu đồ',
        themeColor: 'Màu chủ đề',
        delete: 'Xóa',
      },

      extract: {
        font: 'Phông chữ:',
        textColor: 'Màu chữ:',
        backgroundColor: 'Màu nền:',
        themeColors: 'Các màu chủ đề:',
        excludeTip: '(Nhấn vào các khối màu để loại trừ màu không mong muốn)',
        select: 'Chọn',
        saveSelectedConfiguration: 'Lưu cấu hình đã chọn thành chủ đề',
        extractFromCurrentPage: 'Trích xuất từ trang hiện tại',
        extractFromAllSlides: 'Trích xuất từ tất cả các slide',
        applyToTheme: 'Áp dụng cho chủ đề',
      },
    },

    // Chuyển trang
    transition: {
      applyToAll: 'Áp dụng cho tất cả',
      appliedToAll: 'Đã áp dụng cho tất cả',
    },
  },

  // Hiệu ứng
  animation: {
    addAnimation: 'Thêm hiệu ứng',
    selectElement: 'Chọn một phần tử trên canvas để thêm hiệu ứng',
    preview: 'Xem thử',
    delete: 'Xóa',
    duration: 'Thời lượng',
    trigger: 'Kích hoạt',
    manualTrigger: 'Kích hoạt thủ công',
    withPrevious: 'Cùng với phần trước',
    afterPrevious: 'Sau phần trước',
    changeAnimation: 'Thay đổi hiệu ứng',
    stopPreview: 'Dừng xem thử',
    previewAll: 'Xem thử tất cả',
    entrance: 'Vào',
    exit: 'Thoát',
    emphasis: 'Nhấn mạnh',
  },
};
