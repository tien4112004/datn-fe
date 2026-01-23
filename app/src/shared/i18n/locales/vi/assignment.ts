export default {
  demo: {
    title: 'Demo Bài Tập',
    subtitle: 'Kiểm tra các loại câu hỏi và chế độ',
    controls: {
      title: 'Điều Khiển',
      subtitle: 'Cấu hình cài đặt demo',
      demoMode: {
        label: 'Chế Độ Demo',
        single: 'Câu Hỏi Đơn',
        collection: 'Bộ Câu Hỏi',
      },
      viewMode: {
        label: 'Chế Độ Xem',
      },
      questionType: {
        label: 'Loại Câu Hỏi',
      },
      submit: 'Nộp Bài (Demo)',
    },
  },
  navigation: {
    title: 'Điều Hướng',
    progress: 'Tiến Độ',
    answered: 'đã trả lời',
    previous: 'Trước',
    next: 'Tiếp',
    questionLabel: 'Câu hỏi {{number}}',
    questionAnswered: 'Câu hỏi {{number}} (đã trả lời)',
  },
  collection: {
    title: 'Bộ Câu Hỏi',
    management: {
      title: 'Quản Lý Câu Hỏi',
      addQuestion: {
        label: 'Thêm Câu Hỏi Mới',
        button: 'Thêm Câu Hỏi',
      },
      loadMockData: {
        button: 'Tải Dữ Liệu Mẫu',
        confirmTitle: 'Tải Dữ Liệu Mẫu',
        confirmDescription:
          'Thao tác này sẽ thay thế tất cả câu hỏi hiện tại bằng dữ liệu mẫu. Mọi thay đổi chưa lưu sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?',
        cancel: 'Hủy',
        confirm: 'Tải Dữ Liệu Mẫu',
      },
      questionCount: '{{count}} câu hỏi',
      questionCount_plural: '{{count}} câu hỏi',
      noQuestions: 'Chưa có câu hỏi nào',
      addFirstQuestion: 'Sử dụng thanh bên để thêm câu hỏi',
    },
    item: {
      questionNumber: 'CH{{number}}',
      collapse: 'Thu gọn câu hỏi',
      expand: 'Mở rộng câu hỏi',
      delete: 'Xóa câu hỏi',
      dragToReorder: 'Kéo để sắp xếp lại',
      deleteConfirm: {
        title: 'Xóa Câu Hỏi',
        description: 'Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.',
        cancel: 'Hủy',
        confirm: 'Xóa',
      },
      dataMissingTitle: 'Câu hỏi {{number}} - Thiếu dữ liệu (Debug)',
      dataMissingFieldId: 'ID trường: {{id}}',
      removeQuestionConfirm: 'Xóa câu hỏi {{type}} này?',
      noQuestionText: 'Chưa có nội dung câu hỏi',
      topicLabel: 'Chủ đề *',
      difficultyLabel: 'Độ khó',
      pointsLabel: 'Điểm *',
      selectTopicPlaceholder: 'Chọn chủ đề',
      pointsShort: '{{points}} điểm',
    },
  },
  viewModes: {
    editing: 'Chỉnh Sửa',
    viewing: 'Xem',
    doing: 'Làm Bài',
    afterAssessment: 'Sau Đánh Giá',
    grading: 'Chấm Điểm',
  },
  questionTypes: {
    multipleChoice: 'Trắc Nghiệm',
    matching: 'Nối',
    openEnded: 'Tự Luận',
    fillInBlank: 'Điền Vào Chỗ Trống',
  },
  difficulty: {
    nhanBiet: 'Nhận Biết',
    thongHieu: 'Thông Hiểu',
    vanDung: 'Vận Dụng',
    vanDungCao: 'Vận Dụng Cao',
  },
  debug: {
    questionJson: 'Debug: JSON Câu Hỏi',
    collectionJson: 'Debug: JSON Bộ Câu Hỏi',
  },
  questionBank: {
    title: 'Kho Câu Hỏi',
    subtitle: 'Duyệt và chọn câu hỏi',
    bankTypes: {
      personal: 'Kho Cá Nhân',
      application: 'Kho Ứng Dụng',
    },
    filters: {
      search: 'Tìm kiếm câu hỏi...',
      type: 'Loại Câu Hỏi',
      difficulty: 'Độ Khó',
      subject: 'Môn Học',
      grade: 'Khối Lớp',
      chapter: 'Chương',
      clearFilters: 'Xóa Bộ Lọc',
      allTypes: 'Tất Cả Loại',
      allDifficulties: 'Tất Cả Độ Khó',
      allSubjects: 'Tất Cả Môn',
      noChapters: 'Không có chương',
    },
    selection: {
      selected: '{{count}} đã chọn',
      addSelected: 'Thêm Đã Chọn ({{count}})',
      copySelected: 'Sao Chép Đã Chọn ({{count}})',
      copyToPersonal: 'Sao chép {{count}} vào Kho Cá Nhân',
      copying: 'Đang sao chép...',
      cancel: 'Hủy',
    },
    copyToPersonal: {
      success: 'Đã sao chép {{count}} câu hỏi vào kho cá nhân',
      error: 'Không thể sao chép câu hỏi',
    },
    empty: {
      title: 'Không tìm thấy câu hỏi',
      description: 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm',
    },
    card: {
      points: 'Điểm: {{points}}',
      selected: 'Đã Chọn',
      applicationBadge: 'Chỉ đọc',
      untitled: 'Câu hỏi chưa có tiêu đề',
    },
    subjects: {
      toan: 'Toán',
      tiengViet: 'Tiếng Việt',
      tiengAnh: 'Tiếng Anh',
    },
  },
  shared: {
    imageUploader: {
      label: 'Hình Ảnh',
      uploadButton: 'Tải Lên Hình Ảnh',
      uploading: 'Đang tải lên...',
      preview: 'Xem Trước',
      uploadError: 'Không thể tải lên hình ảnh',
      chooseFromStorage: 'Chọn từ Kho Lưu Trữ',
    },
    imageStorageDialog: {
      title: 'Chọn Hình Ảnh từ Kho Lưu Trữ',
      description: 'Chọn hình ảnh từ những hình ảnh đã tải lên trước đây',
      searchPlaceholder: 'Tìm kiếm hình ảnh...',
      noImages: 'Không tìm thấy hình ảnh',
      imageAlt: 'Hình ảnh trong kho',
      loadMore: 'Tải Thêm',
      loadingMore: 'Đang tải...',
      cancel: 'Hủy',
      select: 'Chọn Hình Ảnh',
    },
  },
  editing: {
    shuffle: {
      shuffleOptions: 'Xáo Trộn Lựa Chọn',
      shuffleOptionsDescription: 'Ngẫu nhiên hóa thứ tự các lựa chọn cho mỗi học sinh',
      shufflePairs: 'Xáo Trộn Cặp',
      shufflePairsDescription: 'Ngẫu nhiên hóa thứ tự các cặp ghép cho mỗi học sinh',
      shuffleQuestions: 'Xáo Trộn Câu Hỏi',
      shuffleQuestionsDescription: 'Ngẫu nhiên hóa thứ tự các câu hỏi cho mỗi học sinh',
    },
    multipleChoice: {
      title: 'Chỉnh Sửa Câu Hỏi Trắc Nghiệm',
      alerts: {
        minOptions: 'Phải có ít nhất 2 lựa chọn',
      },
      labels: {
        question: 'Câu Hỏi',
        questionImage: 'Hình Ảnh Câu Hỏi (tùy chọn)',
        options: 'Các Lựa Chọn',
        explanation: 'Giải Thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập câu hỏi của bạn...',
        option: 'Nhập nội dung lựa chọn...',
        explanation: 'Giải thích câu trả lời đúng...',
      },
      buttons: {
        addOption: 'Thêm Lựa Chọn',
        removeImage: 'Xóa hình ảnh',
        addImage: 'Thêm hình ảnh',
      },
    },
    matching: {
      title: 'Chỉnh Sửa Câu Hỏi Nối',
      alerts: {
        minPairs: 'Phải có ít nhất 2 cặp',
      },
      labels: {
        question: 'Câu Hỏi',
        questionImage: 'Hình Ảnh Câu Hỏi (tùy chọn)',
        matchingPairs: 'Các Cặp Ghép',
        left: 'Trái',
        right: 'Phải',
        explanation: 'Giải Thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập hướng dẫn câu hỏi nối...',
        leftItem: 'Mục bên trái...',
        rightItem: 'Mục bên phải...',
        explanation: 'Giải thích các cặp ghép đúng...',
      },
      buttons: {
        addPair: 'Thêm Cặp',
        addImage: 'Thêm hình ảnh',
        removeImage: 'Xóa hình ảnh',
      },
      pair: 'Cặp {{number}}',
    },
    openEnded: {
      title: 'Chỉnh Sửa Câu Hỏi Tự Luận',
      labels: {
        question: 'Câu Hỏi',
        questionImage: 'Hình Ảnh Câu Hỏi (tùy chọn)',
        maxLength: 'Độ Dài Tối Đa Câu Trả Lời',
        expectedAnswer: 'Câu Trả Lời Mong Đợi (tùy chọn)',
        explanation: 'Giải Thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập câu hỏi của bạn...',
        expectedAnswer: 'Nhập câu trả lời mẫu/mong đợi để tham khảo...',
        explanation: 'Giải thích câu trả lời hay là như thế nào...',
      },
      maxLengthInfo: '{{length}} ký tự (0 = không giới hạn)',
    },
    fillInBlank: {
      title: 'Chỉnh Sửa Câu Hỏi Điền Vào Chỗ Trống',
      alerts: {
        minSegments: 'Phải có ít nhất 1 đoạn',
      },
      labels: {
        title: 'Tiêu Đề (tùy chọn)',
        caseSensitive: 'Phân biệt hoa thường',
        titleImage: 'Hình Ảnh Tiêu Đề (tùy chọn)',
        questionSegments: 'Các Đoạn Câu Hỏi',
        alternativeAnswers: 'Câu trả lời thay thế',
        preview: 'Xem Trước:',
        explanation: 'Giải Thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        title: 'Nhập tiêu đề hoặc hướng dẫn...',
        text: 'Nhập văn bản...',
        correctAnswer: 'Câu trả lời đúng...',
        alternative: 'Câu trả lời thay thế...',
        explanation: 'Giải thích các câu trả lời đúng...',
      },
      buttons: {
        addText: 'Thêm Văn Bản',
        addBlank: 'Thêm Chỗ Trống',
        add: 'Thêm',
      },
      segmentTypes: {
        text: 'Văn Bản',
        blank: 'Chỗ Trống',
      },
    },
  },
  assignmentEditor: {
    // Nút hành động chính
    actions: {
      actions: 'Hành động',
      cancel: 'Hủy',
      save: 'Lưu Bài Tập',
      saving: 'Đang lưu...',
    },

    // Trạng thái tải
    loading: 'Đang tải bài tập...',

    // Thông báo xác thực form
    validation: {
      titleRequired: 'Tiêu đề là bắt buộc',
      subjectRequired: 'Môn học là bắt buộc',
      topicNameRequired: 'Tên chủ đề là bắt buộc',
      invalidQuestions: 'Một số câu hỏi thiếu thông tin bắt buộc',
    },

    // Thông báo toast
    toasts: {
      createSuccess: 'Đã tạo bài tập thành công!',
      updateSuccess: 'Đã cập nhật bài tập thành công!',
      saveError: 'Không thể lưu bài tập',
      noTopicError: 'Vui lòng thêm ít nhất một chủ đề trước khi thêm câu hỏi từ ngân hàng',
      questionsAdded: 'Đã thêm {{count}} câu hỏi vào bài tập',
    },

    // Bảng điều khiển câu hỏi
    questions: {
      panelTitle: 'Câu Hỏi',
      title: 'Câu Hỏi',
      stats: '{{count}} câu hỏi (tổng {{points}} điểm)',
      stats_plural: '{{count}} câu hỏi (tổng {{points}} điểm)',
      addFromBank: 'Thêm Từ Kho',
      toolbar: {
        addQuestion: 'Thêm Câu Hỏi',
        generate: 'Tạo Tự Động',
        fromBank: 'Từ Kho',
        previewMode: 'Chế Độ Xem Trước',
        editMode: 'Chế Độ Chỉnh Sửa',
        tooltips: {
          addQuestion: 'Tạo câu hỏi mới',
          generate: 'Tạo bằng AI sắp ra mắt',
          fromBank: 'Nhập câu hỏi từ kho câu hỏi',
          switchToEdit: 'Chuyển tất cả sang chế độ chỉnh sửa',
          switchToPreview: 'Chuyển tất cả sang chế độ xem trước',
        },
      },
      emptyState: {
        noQuestions: 'Chưa có câu hỏi',
        hint: 'Nhấp "Thêm Câu Hỏi" để bắt đầu',
        title: 'Chưa có câu hỏi nào',
        description: 'Bắt đầu xây dựng bài tập bằng cách thêm câu hỏi từ kho câu hỏi',
      },
    },

    // Bảng điều khiển thông tin bài tập
    metadata: {
      panelTitle: 'Thông Tin Bài Tập',
      edit: 'Chỉnh Sửa',
      title: 'Thông Tin Bài Tập',
      fields: {
        title: 'Tiêu Đề',
        subject: 'Môn Học',
        grade: 'Khối',
        class: 'Lớp',
        description: 'Mô Tả',
        dueDate: 'Hạn Nộp',
        shuffleQuestions: 'Xáo Trộn Câu Hỏi',
        shuffleQuestionsEnabled: 'Bật',
        shuffleQuestionsDisabled: 'Tắt',
        emptyValue: '-',
        titlePlaceholder: 'Nhập tiêu đề bài tập',
        subjectPlaceholder: 'Chọn môn học',
        gradePlaceholder: 'Chọn khối',
        classPlaceholder: 'Chọn lớp',
        descriptionPlaceholder: 'Nhập mô tả bài tập (tùy chọn)',
        dueDatePlaceholder: 'Chọn hạn nộp',
      },
    },

    // Hộp thoại chỉnh sửa thông tin
    metadataDialog: {
      title: 'Chỉnh Sửa Thông Tin Bài Tập',
      description: 'Cập nhật thông tin bài tập. Các thay đổi sẽ được lưu tự động khi bạn đóng hộp thoại này.',
      fields: {
        title: 'Tiêu Đề',
        subject: 'Môn Học',
        grade: 'Khối',
        description: 'Mô Tả',
        shuffleQuestions: 'Xáo trộn câu hỏi cho mỗi học sinh',
      },
      placeholders: {
        title: 'Nhập tiêu đề bài tập',
        subject: 'Chọn môn học',
        grade: 'ví dụ: 1, 2, 3...',
        description: 'Mô tả bài tập (tùy chọn)',
      },
      done: 'Xong',
    },

    // Bảng điều khiển ma trận đánh giá
    matrix: {
      panelTitle: 'Ma Trận Đánh Giá',
      view: 'Xem',
      edit: 'Chỉnh Sửa',
      emptyState: {
        message: 'Chưa cấu hình ma trận đánh giá',
        create: 'Tạo',
      },
      preview: {
        topics: '{{count}} chủ đề',
        topics_plural: '{{count}} chủ đề',
        questions: '{{count}} câu hỏi',
        questions_plural: '{{count}} câu hỏi',
        required: 'Yêu cầu: {{count}}',
      },
    },

    // Hộp thoại chỉnh sửa ma trận
    matrixEditor: {
      title: 'Chỉnh Sửa Ma Trận Đánh Giá',
      description:
        'Cấu hình các chủ đề và số lượng câu hỏi yêu cầu cho mỗi mức độ khó. Các thay đổi sẽ được lưu tự động.',
      topicsLabel: 'Chủ Đề',
      addTopic: 'Thêm Chủ Đề',
      topicPlaceholder: 'Tên chủ đề...',
      descriptionPlaceholder: 'Mô tả chủ đề (tùy chọn)...',
      emptyMessage: 'Thêm chủ đề để xem ma trận',
      done: 'Xong',
      tableHeaders: {
        topic: 'Chủ Đề',
      },
    },

    // Bảng xây dựng ma trận
    matrixBuilder: {
      panelTitle: 'Bảng Ma Trận Đánh Giá',
      description:
        'Cấu hình chủ đề và số lượng câu hỏi yêu cầu cho mỗi mức độ khó. Thay đổi được lưu tự động.',
    },

    // Hộp thoại xem ma trận
    matrixView: {
      title: 'Ma Trận Đánh Giá',
      description: 'Xem ma trận đánh giá đầy đủ hiển thị số câu hỏi yêu cầu và hiện tại.',
      summary: {
        topics: '{{count}} chủ đề',
        topics_plural: '{{count}} chủ đề',
        questions: '{{count}} câu hỏi',
        questions_plural: '{{count}} câu hỏi',
      },
      legend: {
        valid: 'Hợp Lệ',
        warning: 'Cảnh Báo',
        empty: 'Trống',
      },
      tableHeaders: {
        topic: 'Chủ Đề',
        total: 'Tổng',
      },
      close: 'Đóng',
    },

    // Thông tin cơ bản bài tập
    basicInfo: {
      title: 'Thông Tin Bài Tập',
      titleLabel: 'Tiêu đề',
      titlePlaceholder: 'Nhập tiêu đề bài tập...',
      subjectLabel: 'Môn học',
      subjectPlaceholder: 'Chọn môn học',
      descriptionLabel: 'Mô tả',
      descriptionPlaceholder: 'Mô tả bài tập...',
    },

    // Chỉ số số lượng câu hỏi
    questionCountIndicator: {
      noQuestions: 'Chưa có câu hỏi',
      count: '{{count}} Câu hỏi',
      count_plural: '{{count}} Câu hỏi',
    },

    // Chuyển đổi chế độ xem
    viewModeToggle: {
      preview: 'Xem trước',
      edit: 'Chỉnh sửa',
    },

    // Điều hướng câu hỏi
    navigator: {
      questionsCount: '{{count}} Câu hỏi',
      questionsCount_plural: '{{count}} Câu hỏi',
      listView: 'Xem Danh Sách',
      assignmentInfo: 'Thông Tin Bài Tập',
      matrixBuilder: 'Ma Trận',
      untitled: 'Chưa có tiêu đề',
    },

    // Ô ma trận
    matrixCell: {
      required: 'Yêu cầu:',
      ok: 'OK',
    },

    // Xem câu hỏi hiện tại
    currentQuestion: {
      dataMissing: 'Thiếu dữ liệu câu hỏi',
      questionOf: 'Câu hỏi {{current}} trên {{total}}',
      edit: 'Chỉnh sửa',
      preview: 'Xem trước',
      noQuestions: 'Chưa có câu hỏi',
      addQuestionHint: 'Nhấn "Thêm Câu Hỏi" để bắt đầu',
    },

    // Danh sách câu hỏi
    questionsList: {
      emptyTitle: 'Chưa có câu hỏi',
      emptyHint: 'Nhấn "Thêm Câu Hỏi" để bắt đầu',
    },

    // Điều hướng câu hỏi
    questionNavigator: {
      questionCount: '{{count}} Câu hỏi',
      questionCount_plural: '{{count}} Câu hỏi',
      assignmentInfo: 'Thông Tin Bài Tập',
      untitled: 'Chưa có tiêu đề',
    },

    // Xem trước nội dung câu hỏi
    questionPreview: {
      multipleChoice: '{{count}} lựa chọn • Đúng: {{correct}}',
      matching: '{{count}} cặp',
      matching_plural: '{{count}} cặp',
      fillInBlank: '{{count}} chỗ trống',
      fillInBlank_plural: '{{count}} chỗ trống',
      openEnded: {
        withLimit: 'Trả lời tự do ({{limit}} ký tự)',
        unlimited: 'Trả lời tự do (không giới hạn)',
      },
      placeholderWarning: 'Có nội dung giữ chỗ hoặc trống',
      noAnswerWarning: 'Chưa có câu trả lời mong đợi',
    },
  },

  teacherQuestionBank: {
    title: 'Ngân hàng câu hỏi của tôi',
    subtitle: 'Quản lý thư viện câu hỏi cá nhân',

    actions: {
      create: 'Tạo câu hỏi',
      import: 'Nhập CSV',
      export: 'Xuất CSV',
      edit: 'Chỉnh sửa',
      duplicate: 'Nhân bản',
      delete: 'Xóa',
      deleteSelected: 'Xóa đã chọn',
      copyToPersonal: 'Sao chép vào kho cá nhân',
      browsePublic: 'Duyệt câu hỏi công khai',
    },

    filters: {
      bankType: 'Loại kho',
      all: 'Tất cả câu hỏi',
      personalOnly: 'Chỉ cá nhân',
      applicationOnly: 'Chỉ ứng dụng',
      clearFilters: 'Xóa bộ lọc',
    },

    table: {
      columns: {
        title: 'Tiêu đề',
        content: 'Nội dung',
        questionType: 'Loại câu hỏi',
        subject: 'Môn học',
        grade: 'Lớp',
        difficulty: 'Độ khó',
        points: 'Điểm',
      },
      noQuestions: 'Không tìm thấy câu hỏi',
      loading: 'Đang tải câu hỏi...',
    },

    empty: {
      noQuestions: {
        title: 'Chưa có câu hỏi',
        description: 'Tạo câu hỏi đầu tiên hoặc nhập từ CSV để bắt đầu.',
      },
      noResults: {
        title: 'Không tìm thấy câu hỏi',
        description: 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.',
      },
      noPersonal: {
        message: 'Bạn chưa có câu hỏi cá nhân. Sao chép câu hỏi từ kho ứng dụng hoặc tạo mới.',
      },
    },

    dialogs: {
      copyToPersonal: {
        title: 'Sao chép vào kho cá nhân',
        description:
          'Thao tác này sẽ tạo bản sao câu hỏi trong kho cá nhân của bạn. Sau đó bạn có thể chỉnh sửa tự do.',
        confirm: 'Sao chép câu hỏi',
        cancel: 'Hủy',
      },
      delete: {
        title: 'Xóa câu hỏi',
        description: 'Bạn có chắc chắn muốn xóa {{count}} câu hỏi? Hành động này không thể hoàn tác.',
        confirm: 'Xóa',
        cancel: 'Hủy',
      },
    },

    toast: {
      createSuccess: 'Tạo câu hỏi thành công',
      createError: 'Không thể tạo câu hỏi',
      updateSuccess: 'Cập nhật câu hỏi thành công',
      updateError: 'Không thể cập nhật câu hỏi',
      deleteSuccess: 'Xóa câu hỏi thành công',
      deleteError: 'Không thể xóa câu hỏi',
      duplicateSuccess: 'Nhân bản câu hỏi thành công',
      duplicateError: 'Không thể nhân bản câu hỏi',
      copySuccess: 'Sao chép câu hỏi vào kho cá nhân thành công',
      copyError: 'Không thể sao chép câu hỏi',
      exportSuccess: 'Xuất câu hỏi thành công',
      exportError: 'Không thể xuất câu hỏi',
      importSuccess: 'Nhập câu hỏi thành công',
      importError: 'Không thể nhập câu hỏi',
    },

    pagination: {
      showing: 'Hiển thị {{from}} đến {{to}} trong {{total}} câu hỏi',
      previous: 'Trước',
      next: 'Sau',
    },
  },

  dialogs: {
    copyToPersonal: {
      title: 'Sao Chép vào Kho Cá Nhân',
      description: 'Thao tác này sẽ tạo bản sao câu hỏi trong kho cá nhân của bạn.',
      questionToCopy: 'Câu hỏi cần sao chép:',
      message: 'Câu hỏi đã sao chép sẽ được thêm vào kho cá nhân và bạn có thể chỉnh sửa hoặc xóa tùy ý.',
      cancel: 'Hủy',
      copying: 'Đang sao chép...',
      copyQuestion: 'Sao Chép Câu Hỏi',
    },
    importQuestions: {
      title: 'Nhập Câu Hỏi từ CSV',
      description: 'Tải lên tệp CSV chứa các câu hỏi để nhập vào kho câu hỏi cá nhân.',
      downloadTemplate: 'Tải Xuống Mẫu CSV',
      uploadPlaceholder: 'Nhấp để tải lên hoặc kéo thả',
      fileTypeInfo: 'Chỉ chấp nhận tệp CSV',
      successMessage: 'Đã nhập thành công {{count}} câu hỏi',
      errorMessage: 'Nhập hoàn tất có lỗi: {{success}} thành công, {{failed}} thất bại',
      errorDetails: 'Chi tiết lỗi:',
      moreErrors: '... và {{count}} lỗi khác',
      formatRequirements: 'Yêu Cầu Định Dạng CSV:',
      requirement1: 'Hàng đầu tiên phải chứa tiêu đề: type, title, difficulty, subject, points, content',
      requirement2: 'type phải là một trong: multipleChoice, matching, openEnded, fillInBlank',
      requirement3: 'difficulty phải là một trong: nhanBiet, thongHieu, vanDung, vanDungCao',
      requirement4: 'subject phải là một trong: toan, tiengViet, tiengAnh',
      requirement5: 'content phải là JSON hợp lệ cho loại câu hỏi tương ứng',
      close: 'Đóng',
      cancel: 'Hủy',
      importing: 'Đang nhập...',
      importQuestions: 'Nhập Câu Hỏi',
    },
    questionForm: {
      titleCreate: 'Tạo Câu Hỏi Mới',
      titleEdit: 'Chỉnh Sửa Câu Hỏi',
      metadataSection: 'Thông Tin Câu Hỏi',
      contentSection: 'Nội Dung Câu Hỏi',
      validationErrors: 'Lỗi Xác Thực',
      labels: {
        questionType: 'Loại Câu Hỏi',
        subject: 'Môn Học',
        difficulty: 'Độ Khó',
        points: 'Điểm',
      },
      questionTypes: {
        multipleChoice: 'Trắc Nghiệm',
        matching: 'Nối',
        openEnded: 'Tự Luận',
        fillInBlank: 'Điền Vào Chỗ Trống',
      },
      subjects: {
        math: 'Toán',
        vietnamese: 'Tiếng Việt',
        english: 'Tiếng Anh',
      },
      difficulties: {
        nhanBiet: 'Nhận biết',
        thongHieu: 'Thông hiểu',
        vanDung: 'Vận dụng',
        vanDungCao: 'Vận dụng cao',
      },
      buttons: {
        cancel: 'Hủy',
        create: 'Tạo Câu Hỏi',
        save: 'Lưu Thay Đổi',
      },
      errors: {
        missingData: 'Thiếu dữ liệu câu hỏi',
        validationFailed: 'Vui lòng sửa các lỗi xác thực trước khi lưu',
      },
    },
    unsavedChanges: {
      title: 'Thay Đổi Chưa Lưu',
      description: 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?',
      stay: 'Ở Lại',
      leave: 'Rời Đi',
    },
    deleteAssignment: {
      title: 'Xóa Bài Tập?',
      description: 'Hành động này không thể hoàn tác. Bài tập sẽ bị xóa vĩnh viễn.',
      cancel: 'Hủy',
      delete: 'Xóa',
    },
  },

  preview: {
    optionsCorrect: 'lựa chọn • Đúng:',
    placeholderContent: 'Có nội dung trống hoặc giữ chỗ',
    pairs: 'cặp',
    blanks: 'chỗ trống',
    freeResponse: 'Tự luận ({{limit}})',
    noExpectedAnswer: 'Chưa có câu trả lời mong đợi',
  },

  common: {
    unsavedChanges: 'Thay đổi chưa lưu',
  },
};
