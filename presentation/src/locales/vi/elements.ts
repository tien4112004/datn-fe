export default {
  // Thành phần & Nội dung
  elements: {
    // Loại thành phần
    types: {
      text: 'Văn bản',
      image: 'Hình ảnh',
      shape: 'Hình dạng',
      line: 'Đường thẳng',
      chart: 'Biểu đồ',
      table: 'Bảng',
      video: 'Video',
      audio: 'Âm thanh',
      formula: 'Công thức',
    },

    // Thành phần văn bản
    text: {
      editor: {
        // Điều khiển văn bản
        textColor: 'Màu chữ',
        textHighlight: 'Tô sáng văn bản',
        increaseFontSize: 'Tăng cỡ chữ',
        decreaseFontSize: 'Giảm cỡ chữ',
        bold: 'In đậm',
        italic: 'In nghiêng',
        underline: 'Gạch dưới',
        strikethrough: 'Gạch ngang',
        superscript: 'Chỉ số trên',
        subscript: 'Chỉ số dưới',
        inlineCode: 'Mã nội dòng',
        blockquote: 'Trích dẫn',
        clearFormatting: 'Xóa định dạng',
        formatPainter: 'Cọ định dạng (Nhấp đúp để sử dụng liên tục)',

        // Liên kết
        enterHyperlink: 'Nhập liên kết',
        hyperlink: 'Liên kết',
        remove: 'Gỡ bỏ',
        confirm: 'Xác nhận',
        invalidWebLink: 'Địa chỉ liên kết không hợp lệ',

        // Tính năng AI
        aiBeautify: 'Làm đẹp',
        aiExpand: 'Mở rộng',
        aiSimplify: 'Đơn giản hóa',
        aiAssistant: 'Trợ lý AI',
        noTextContentToExecute: 'Không có nội dung văn bản để thực thi',

        // Phông chữ
        searchFont: 'Tìm phông chữ',
        searchFontSize: '',

        // Căn chỉnh
        alignLeft: 'Căn trái',
        alignCenter: 'Căn giữa',
        alignRight: 'Căn phải',
        justify: 'Căn đều',

        // Danh sách
        bulletList: 'Danh sách dấu đầu dòng',
        numberedList: 'Danh sách đánh số',

        // Thụt lề
        decreaseIndent: 'Giảm thụt lề',
        reduceFirstLineIndent: 'Giảm thụt lề dòng đầu',
        increaseFirstLineIndent: 'Tăng thụt lề dòng đầu',
        increaseIndent: 'Tăng thụt lề',
      },

      prosemirror: {
        fontLoadingWait: 'Phông chữ cần thời gian tải xuống để áp dụng, vui lòng chờ',
      },
    },

    // Thành phần bảng
    table: {
      interaction: {
        doubleClickToEdit: 'Nhấp đúp để chỉnh sửa',
      },

      // Cột
      columns: {
        insertColumn: 'Chèn cột',
        toTheLeft: 'Về bên trái',
        toTheRight: 'Về bên phải',
        deleteColumn: 'Xóa cột',
        selectCurrentColumn: 'Chọn cột hiện tại',
      },

      // Hàng
      rows: {
        insertRow: 'Chèn hàng',
        above: 'Phía trên',
        below: 'Phía dưới',
        deleteRow: 'Xóa hàng',
        selectCurrentRow: 'Chọn hàng hiện tại',
      },

      // Ô
      cells: {
        mergeCells: 'Gộp ô',
        unmergeCells: 'Tách ô',
        selectAllCells: 'Chọn tất cả ô',
      },
    },

    // Thành phần phương tiện
    media: {
      // Âm thanh
      audio: {
        audioLoadingFailed: 'Tải âm thanh thất bại',
      },

      // Video
      video: {
        videoFailedToLoad: 'Tải video thất bại',
        speed: 'Tốc độ',
        on: 'Bật',
        off: 'Tắt',
      },

      // Hình thu nhỏ
      thumbnails: {
        loading: 'Đang tải...',
      },
    },

    // Thành phần biểu đồ
    charts: {
      dataEditor: {
        confirm: 'Xác nhận',
        clickToChange: 'Nhấp để thay đổi',
        cancel: 'Hủy',
        clearData: 'Xóa dữ liệu',
        yAxis: 'Trục Y',
      },
    },

    // Thành phần LaTeX
    latex: {
      editor: {
        commonSymbols: 'Ký hiệu phổ biến',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        formulaCannotBeEmpty: 'Công thức không được để trống',
        formulaPreview: 'Xem trước công thức',
        presetFormulas: 'Công thức có sẵn',
        placeholder: 'Nhập công thức LaTeX',
      },
    },

    // Trình chỉnh sửa dàn ý
    outline: {
      hierarchy: {
        theme: 'Chủ đề',
        chapter: 'Chương',
        section: 'Phần',
      },

      actions: {
        // Hành động với Chương
        addSubOutlineChapter: 'Thêm dàn ý con (Chương)',
        addSameLevelAboveChapter: 'Thêm cùng cấp phía trên (Chương)',
        deleteThisChapter: 'Xóa chương này',

        // Hành động với Phần
        addSubOutlineSection: 'Thêm dàn ý con (Phần)',
        addSameLevelAboveSection: 'Thêm cùng cấp phía trên (Phần)',
        deleteThisSection: 'Xóa phần này',

        // Hành động với Mục
        addSubOutlineItem: 'Thêm dàn ý con (Mục)',
        addSameLevelAboveItem: 'Thêm cùng cấp phía trên (Mục)',
        addSameLevelBelowItem: 'Thêm cùng cấp phía dưới (Mục)',
        deleteThisItem: 'Xóa mục này',
      },

      defaults: {
        newChapter: 'Chương mới',
        newSection: 'Phần mới',
        newItem: 'Mục mới',
      },
    },
  },
};
