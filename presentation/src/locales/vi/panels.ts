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
      title: 'Thư viện hình ảnh',
      searchPlaceholder: 'Tìm kiếm hình ảnh',
      loading: 'Đang tải...',
      insert: 'Chèn',
      tabs: {
        pexels: 'Pexels',
        myImages: 'Ảnh của tôi',
      },
      orientations: {
        all: 'Tất cả',
        landscape: 'Ngang',
        portrait: 'Dọc',
        square: 'Vuông',
      },
      defaultSearch: '',
      errorNoQuery: 'Vui lòng nhập từ khóa tìm kiếm',
      emptyStates: {
        noImages: 'Chưa có ảnh nào được tải lên',
        noSearchResults: 'Không tìm thấy ảnh',
      },
      failedToLoad: 'Tải hình ảnh thất bại',
    },

    // Bảng AI Sửa đổi
    aiModification: {
      title: 'AI Sửa đổi',
      context: {
        slide: 'Trang chiếu hiện tại',
        element: 'Thành phần đã chọn',
        textElement: 'Thành phần văn bản',
        imageElement: 'Thành phần hình ảnh',
        elements: '{count} Thành phần',
        combinedText: 'Các mục văn bản kết hợp',
        generate: 'Tạo mới',
      },
      categories: {
        text: 'Văn bản',
        design: 'Thiết kế',
        generate: 'Tạo mới',
      },
      actions: {
        // Hành động văn bản cho Slide & Element
        improveWriting: 'Cải thiện văn bản',
        improveWritingDesc: 'Nâng cao độ rõ ràng, ngữ pháp và phong cách',
        translateContent: 'Dịch nội dung',
        translateContentDesc: 'Dịch sang ngôn ngữ khác',
        summarizeSlide: 'Tóm tắt trang chiếu',
        summarizeSlideDesc: 'Thu gọn thành các điểm chính',
        expandContent: 'Mở rộng nội dung',
        expandContentDesc: 'Thêm chi tiết và độ sâu',
        rewriteText: 'Viết lại văn bản',
        rewriteTextDesc: 'Cách diễn đạt thay thế',
        fixGrammar: 'Sửa ngữ pháp',
        fixGrammarDesc: 'Sửa ngữ pháp và chính tả',
        changeTone: 'Thay đổi giọng điệu',
        changeToneDesc: 'Điều chỉnh giọng viết',
        bulletConversion: 'Chuyển đổi dấu đầu dòng',
        bulletConversionDesc: 'Chuyển đổi định dạng',

        // Hành động thiết kế
        redesignLayout: 'Thiết kế lại bố cục',
        redesignLayoutDesc: 'Sắp xếp bố cục thay thế',
        enhanceHierarchy: 'Tăng cường phân cấp trực quan',
        enhanceHierarchyDesc: 'Cải thiện kích thước và nhấn mạnh văn bản',
        suggestColorScheme: 'Đề xuất bảng màu',
        suggestColorSchemeDesc: 'Gợi ý màu sắc',

        // Hành động hình ảnh
        generateAltText: 'Tạo văn bản thay thế',
        generateAltTextDesc: 'Tạo văn bản mô tả',
        suggestSimilar: 'Đề xuất hình ảnh tương tự',
        suggestSimilarDesc: 'Tìm hình ảnh giống về mặt hình ảnh',
        enhanceImage: 'Cải thiện hình ảnh',
        enhanceImageDesc: 'Áp dụng bộ lọc và điều chỉnh',

        // Hành động nhiều thành phần
        alignBalance: 'Căn chỉnh & Cân bằng',
        alignBalanceDesc: 'Đề xuất căn chỉnh thông minh',
        createGrouping: 'Tạo nhóm',
        createGroupingDesc: 'Đề xuất nhóm hợp lý',

        // Hành động tạo mới
        generateFromTopic: 'Tạo từ chủ đề',
        generateFromTopicDesc: 'Tạo trang chiếu về một chủ đề',
        createConclusion: 'Tạo trang chiếu kết luận',
        createConclusionDesc: 'Tóm tắt từ bài thuyết trình',
        createAgenda: 'Tạo chương trình/Mục lục',
        createAgendaDesc: 'Bảng nội dung',
      },
      parameters: {
        tone: 'Giọng điệu',
        style: 'Phong cách',
        targetLanguage: 'Ngôn ngữ đích',
        length: 'Độ dài',
        depth: 'Độ sâu',
        formality: 'Tính trang trọng',
        format: 'Định dạng',
        stylePreference: 'Tùy chọn phong cách',
        emphasisLevel: 'Mức độ nhấn mạnh',
        mood: 'Tâm trạng',
        detailLevel: 'Mức độ chi tiết',
        source: 'Nguồn',
        enhancementType: 'Loại cải thiện',
        layoutPreference: 'Tùy chọn bố cục',
        groupBy: 'Nhóm theo',
        topic: 'Chủ đề',
        slideCount: 'Số lượng trang chiếu',
        focusArea: 'Khu vực tập trung',
        includeSlideNumbers: 'Bao gồm số trang chiếu',
      },
      options: {
        professional: 'Chuyên nghiệp',
        casual: 'Thân mật',
        academic: 'Học thuật',
        friendly: 'Thân thiện',
        persuasive: 'Thuyết phục',
        informative: 'Cung cấp thông tin',
        concise: 'Súc tích',
        balanced: 'Cân bằng',
        detailed: 'Chi tiết',
        brief: 'Ngắn gọn',
        moderate: 'Vừa phải',
        comprehensive: 'Toàn diện',
        light: 'Nhẹ',
        strong: 'Mạnh',
        modern: 'Hiện đại',
        classic: 'Cổ điển',
        minimal: 'Tối giản',
        subtle: 'Tinh tế',
        creative: 'Sáng tạo',
        energetic: 'Năng động',
        bullets: 'Dấu đầu dòng',
        numbered: 'Danh sách đánh số',
        paragraph: 'Đoạn văn',
        pexels: 'Pexels',
        library: 'Thư viện',
        brightness: 'Độ sáng',
        contrast: 'Độ tương phản',
        sharpen: 'Làm sắc nét',
        grid: 'Lưới',
        freeform: 'Tự do',
        centered: 'Căn giữa',
        proximity: 'Gần nhau',
        type: 'Loại',
        color: 'Màu sắc',
      },
      buttons: {
        cancel: 'Hủy',
        apply: 'Áp dụng',
        preview: 'Xem trước',
        replaceImage: 'Thay thế hình ảnh',
      },
      states: {
        processing: 'AI đang xử lý...',
        selectAction: 'Chọn một hành động để bắt đầu',
        noActions: 'Không có hành động nào cho ngữ cảnh này',
        selectSingleElement: 'Chọn một thành phần để sử dụng sửa đổi AI',
        noActionsForElementType: 'Không có hành động AI nào cho loại thành phần này',
      },
      errors: {
        processingFailed: 'Xử lý AI thất bại. Vui lòng thử lại.',
        retry: 'Thử lại',
      },
      // Gợi ý ngữ cảnh
      contextHints: {
        refiningText: 'Tinh chỉnh thành phần văn bản đã chọn',
        modifyText: 'Mô tả cách sửa đổi văn bản này...',
        modifySlide: 'Mô tả cách thay đổi trang chiếu này...',
        modifyItems: 'Mô tả cách sửa đổi các mục này...',
      },
      // Tạo hình ảnh
      imageGeneration: {
        replaceImage: 'Thay thế hình ảnh này',
        imageDescription: 'Mô tả hình ảnh mới',
        describeImage: 'Mô tả hình ảnh mới...',
        matchSlideTheme: 'Khớp với chủ đề trang chiếu',
        generating: 'Đang tạo...',
        generateImage: 'Tạo hình ảnh',
        generatedPreview: 'Xem trước hình ảnh được tạo',
        loadingModels: 'Đang tải mô hình...',
        noModels: 'Không có mô hình IMAGE nào có sẵn. Sử dụng mặc định.',
        imagePreviewAlt: 'Xem trước hình ảnh',
      },
      // Bố cục & Tạo kiểu
      layout: {
        label: 'Bố cục',
        changeTooltip: 'Thay đổi bố cục trang chiếu thành {layoutType}',
      },
      artStyle: {
        label: 'Phong cách nghệ thuật',
      },
      imageGenerationModel: {
        label: 'Mô hình tạo hình ảnh',
      },
      // Chat/Input
      chat: {
        defaultPlaceholder: 'Nhập hướng dẫn của bạn...',
      },
      // Xem trước
      preview: {
        label: 'Xem trước:',
      },
    },
  },
};
