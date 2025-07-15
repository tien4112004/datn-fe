export default {
  // Thao tác Tệp
  files: {
    // Xuất
    export: {
      // Tùy chọn chung
      common: {
        exportRange: 'Phạm vi xuất:',
        customRange: 'Phạm vi tùy chỉnh: ({min} ~ {max})',
        close: 'Đóng',
        exporting: 'Đang xuất...',
        all: 'Tất cả',
        currentPage: 'Trang hiện tại',
        custom: 'Tùy chỉnh',
      },

      // Xuất JSON
      json: {
        exportJSON: 'Xuất JSON',
      },

      // Xuất PPTX
      pptx: {
        exportPPTX: 'Xuất PPTX',
        ignoreAudioVideo: 'Bỏ qua Âm thanh/Video:',
        ignoreAudioVideoTooltip: `Theo mặc định, âm thanh và video sẽ bị bỏ qua khi xuất. Nếu bài trình chiếu của bạn có chứa các yếu tố âm thanh hoặc video và bạn muốn đưa chúng vào tệp PPTX xuất ra, bạn có thể tắt tùy chọn 'Bỏ qua Âm thanh/Video'. Tuy nhiên, lưu ý rằng điều này sẽ làm tăng đáng kể thời gian xuất.`,
        overwriteDefaultMaster: 'Ghi đè bố cục mặc định:',
        note: 'Lưu ý: 1. Các định dạng được hỗ trợ: avi, mp4, mov, wmv, mp3, wav; 2. Các tài nguyên bị chặn bởi chính sách cross-origin sẽ không thể xuất.',
      },

      // Xuất định dạng PPTist
      pptist: {
        exportPptistFile: 'Xuất tệp .pptist',
        pptistTip:
          '.pptist là phần mở rộng tệp riêng của ứng dụng này, hỗ trợ nhập lại các tệp cùng định dạng vào ứng dụng.',
      },

      // Xuất hình ảnh
      image: {
        exportImage: 'Xuất hình ảnh',
        imageQuality: 'Chất lượng hình ảnh:',
        exportFormat: 'Định dạng xuất:',
        ignoreOnlineFonts: 'Bỏ qua phông chữ trực tuyến:',
        ignoreOnlineFontsTooltip:
          "Theo mặc định, phông chữ trực tuyến sẽ bị bỏ qua khi xuất. Nếu bạn sử dụng phông chữ trực tuyến trong slide và muốn giữ nguyên kiểu chữ khi xuất, bạn có thể tắt tùy chọn 'Bỏ qua phông chữ trực tuyến'. Tuy nhiên, điều này sẽ làm tăng thời gian xuất.",
      },

      // Xuất PDF
      pdf: {
        printExportPDF: 'In / Xuất PDF',
        perPageCount: 'Số slide mỗi trang:',
        edgePadding: 'Lề trang:',
        tip: "Mẹo: Nếu bản xem trước in không khớp với kiểu thực tế, vui lòng kiểm tra tùy chọn [Đồ họa nền] trong cửa sổ in hiện ra.",
      },
    },

    // Nhập
    import: {
      xAxis: 'Trục X',
      yAxis: 'Trục Y',
    },
  },
};
