export default {
  // Thư viện nội dung
  content: {
    // Hình dạng
    shapes: {
      categories: {
        common: 'Hình dạng phổ biến',
        rectangle: 'Hình chữ nhật',
        arrow: 'Mũi tên',
        other: 'Hình dạng khác',
        series: 'Chuỗi',
      },
    },

    // Ký hiệu
    symbols: {
      categories: {
        letter: 'Chữ cái',
        number: 'Số',
        math: 'Toán học',
        arrow: 'Mũi tên',
        shape: 'Hình dạng',
      },
    },

    // Đường thẳng
    lines: {
      types: {
        straightLine: 'Đường thẳng',
        brokenLine: 'Đường gấp khúc, Đường cong',
      },
    },

    // LaTeX
    latex: {
      categories: {
        math: 'Toán học',
        group: 'Nhóm',
        function: 'Hàm số',
        greekLetter: 'Chữ Hy Lạp',
      },
    },

    // Cắt ảnh
    imageClip: {
      shapes: {
        rectangle: 'Hình chữ nhật',
        rectangle2: 'Hình chữ nhật 2',
        roundedRectangle: 'Hình chữ nhật bo góc',
        circle: 'Hình tròn',
        triangle: 'Hình tam giác',
        rhombus: 'Hình thoi',
        pentagon: 'Hình ngũ giác',
        hexagon: 'Hình lục giác',
        heptagon: 'Hình thất giác',
        octagon: 'Hình bát giác',
        chevron: 'Hình chữ V',
        point: 'Hình chóp nhọn',
        arrow: 'Mũi tên',
        parallelogram: 'Hình bình hành',
        parallelogram2: 'Hình bình hành 2',
        trapezoid: 'Hình thang',
        trapezoid2: 'Hình thang 2',
      },
    },

    // Hiệu ứng
    animations: {
      // Hiệu ứng xuất hiện
      entrance: {
        bounce: 'Nảy',
        bounceIn: 'Nảy vào',
        bounceInRight: 'Nảy vào từ phải',
        bounceInLeft: 'Nảy vào từ trái',
        bounceInUp: 'Nảy vào từ dưới',
        bounceInDown: 'Nảy vào từ trên',
        fadeIn: 'Mờ dần xuất hiện',
        fadeInDown: 'Mờ dần từ trên',
        fadeInDownBig: 'Mờ dần từ trên (lớn)',
        fadeInRight: 'Mờ dần từ phải',
        fadeInRightBig: 'Mờ dần từ phải (lớn)',
        fadeInLeft: 'Mờ dần từ trái',
        fadeInLeftBig: 'Mờ dần từ trái (lớn)',
        fadeInUp: 'Mờ dần từ dưới',
        fadeInUpBig: 'Mờ dần từ dưới (lớn)',
        fadeInTopLeft: 'Mờ dần từ trên trái',
        fadeInTopRight: 'Mờ dần từ trên phải',
        fadeInBottomLeft: 'Mờ dần từ dưới trái',
        fadeInBottomRight: 'Mờ dần từ dưới phải',
        rotateIn: 'Xoay vào',
        rotateInDownLeft: 'Xoay vào từ dưới trái',
        rotateInDownRight: 'Xoay vào từ dưới phải',
        rotateInUpLeft: 'Xoay vào từ trên trái',
        rotateInUpRight: 'Xoay vào từ trên phải',
        zoomIn: 'Phóng to vào',
        zoomInDown: 'Phóng to vào từ trên',
        zoomInLeft: 'Phóng to vào từ trái',
        zoomInRight: 'Phóng to vào từ phải',
        zoomInUp: 'Phóng to vào từ dưới',
        slideIn: 'Trượt vào',
        slideInDown: 'Trượt vào từ trên',
        slideInLeft: 'Trượt vào từ trái',
        slideInRight: 'Trượt vào từ phải',
        slideInUp: 'Trượt vào từ dưới',
        flipIn: 'Lật vào',
        flipInXAxis: 'Lật trục X',
        flipInYAxis: 'Lật trục Y',
        backZoomIn: 'Thu nhỏ rồi phóng to vào',
        backZoomInDown: 'Thu nhỏ rồi phóng to vào từ trên',
        backZoomInLeft: 'Thu nhỏ rồi phóng to vào từ trái',
        backZoomInRight: 'Thu nhỏ rồi phóng to vào từ phải',
        backZoomInUp: 'Thu nhỏ rồi phóng to vào từ dưới',
        lightSpeedIn: 'Tốc độ ánh sáng vào',
        lightSpeedInRight: 'Tốc độ ánh sáng vào từ phải',
        lightSpeedInLeft: 'Tốc độ ánh sáng vào từ trái',
      },

      // Hiệu ứng thoát
      exit: {
        bounceOut: 'Nảy ra',
        bounceOutLeft: 'Nảy ra bên trái',
        bounceOutRight: 'Nảy ra bên phải',
        bounceOutUp: 'Nảy ra phía trên',
        bounceOutDown: 'Nảy ra phía dưới',
        fadeOut: 'Mờ dần biến mất',
        fadeOutDown: 'Mờ dần xuống dưới',
        fadeOutDownBig: 'Mờ dần xuống dưới (lớn)',
        fadeOutLeft: 'Mờ dần sang trái',
        fadeOutLeftBig: 'Mờ dần sang trái (lớn)',
        fadeOutRight: 'Mờ dần sang phải',
        fadeOutRightBig: 'Mờ dần sang phải (lớn)',
        fadeOutUp: 'Mờ dần lên trên',
        fadeOutUpBig: 'Mờ dần lên trên (lớn)',
        fadeOutTopLeft: 'Mờ dần trên trái',
        fadeOutTopRight: 'Mờ dần trên phải',
        fadeOutBottomLeft: 'Mờ dần dưới trái',
        fadeOutBottomRight: 'Mờ dần dưới phải',
        rotateOut: 'Xoay ra',
        rotateOutDownLeft: 'Xoay ra dưới trái',
        rotateOutDownRight: 'Xoay ra dưới phải',
        rotateOutUpLeft: 'Xoay ra trên trái',
        rotateOutUpRight: 'Xoay ra trên phải',
        zoomOut: 'Thu nhỏ ra',
        zoomOutDown: 'Thu nhỏ xuống',
        zoomOutLeft: 'Thu nhỏ sang trái',
        zoomOutRight: 'Thu nhỏ sang phải',
        zoomOutUp: 'Thu nhỏ lên',
        slideOut: 'Trượt ra',
        slideOutDown: 'Trượt xuống',
        slideOutLeft: 'Trượt sang trái',
        slideOutRight: 'Trượt sang phải',
        slideOutUp: 'Trượt lên',
        flipOut: 'Lật ra',
        flipOutX: 'Lật ra trục X',
        flipOutY: 'Lật ra trục Y',
        backZoomOut: 'Phóng to rồi thu nhỏ ra',
        backZoomOutDown: 'Phóng to rồi thu nhỏ ra xuống',
        backZoomOutLeft: 'Phóng to rồi thu nhỏ ra trái',
        backZoomOutRight: 'Phóng to rồi thu nhỏ ra phải',
        backZoomOutUp: 'Phóng to rồi thu nhỏ ra lên',
        lightSpeedOut: 'Tốc độ ánh sáng ra',
        lightSpeedOutRight: 'Tốc độ ánh sáng ra bên phải',
        lightSpeedOutLeft: 'Tốc độ ánh sáng ra bên trái',
      },

      // Hiệu ứng nhấn mạnh
      emphasis: {
        shake: 'Lắc',
        shakeLeftAndRight: 'Lắc trái phải',
        shakeUpAndDown: 'Lắc lên xuống',
        headShake: 'Lắc đầu',
        swing: 'Đung đưa',
        wobble: 'Lắc lư',
        tada: 'Tada',
        jello: 'Rung như thạch',
        flash: 'Chớp',
        pulse: 'Nhịp tim',
        rubberBand: 'Co giãn',
        heartBeatFast: 'Nhịp tim nhanh',
      },

      // Hiệu ứng chuyển trang
      transitions: {
        slideLeftAndRight: 'Trượt trái và phải',
        slideLeftAndRight3D: 'Trượt trái và phải 3D',
        slideUpAndDown3D: 'Trượt lên và xuống 3D',
        slideUpAndDown: 'Trượt lên và xuống',
        fadeInAndOut: 'Mờ dần vào và ra',
        rotate: 'Xoay',
        expandUpAndDown: 'Mở rộng lên và xuống',
        expandLeftAndRight: 'Mở rộng trái và phải',
      },

      // Tùy chọn đặc biệt
      special: {
        other: 'Khác',
        none: 'Không có',
        random: 'Ngẫu nhiên',
      },
    },
  },
};
