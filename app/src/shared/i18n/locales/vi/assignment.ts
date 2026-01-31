export default {
  demo: {
    title: 'Demo bài tập',
    subtitle: 'Kiểm tra các loại câu hỏi và chế độ',
    controls: {
      title: 'Điều khiển',
      subtitle: 'Cấu hình cài đặt demo',
      demoMode: {
        label: 'Chế độ demo',
        single: 'Câu hỏi đơn',
        collection: 'Bộ câu hỏi',
      },
      viewMode: {
        label: 'Chế độ xem',
      },
      questionType: {
        label: 'Loại câu hỏi',
      },
      submit: 'Nộp bài (Demo)',
    },
  },
  navigation: {
    title: 'Điều hướng',
    progress: 'Tiến độ',
    answered: 'đã trả lời',
    previous: 'Trước',
    next: 'Tiếp',
    questionLabel: 'Câu hỏi {{number}}',
    questionAnswered: 'Câu hỏi {{number}} (đã trả lời)',
  },
  collection: {
    title: 'Bộ câu hỏi',
    management: {
      title: 'Quản lý câu hỏi',
      addQuestion: {
        label: 'Thêm câu hỏi mới',
        button: 'Thêm câu hỏi',
      },
      loadMockData: {
        button: 'Tải dữ liệu mẫu',
        confirmTitle: 'Tải dữ liệu mẫu',
        confirmDescription:
          'Thao tác này sẽ thay thế tất cả câu hỏi hiện tại bằng dữ liệu mẫu. Mọi thay đổi chưa lưu sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?',
        cancel: 'Hủy',
        confirm: 'Tải dữ liệu mẫu',
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
        title: 'Xóa câu hỏi',
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
    editing: 'Chỉnh sửa',
    viewing: 'Xem',
    doing: 'Làm bài',
    afterAssessment: 'Sau đánh giá',
    grading: 'Chấm điểm',
  },
  questionTypes: {
    multipleChoice: 'Trắc nghiệm',
    matching: 'Nối',
    openEnded: 'Tự luận',
    fillInBlank: 'Điền vào chỗ trống',
  },
  difficulty: {
    nhanBiet: 'Nhận biết',
    thongHieu: 'Thông hiểu',
    vanDung: 'Vận dụng',
    vanDungCao: 'Vận dụng cao',
  },
  debug: {
    questionJson: 'Debug: JSON Câu Hỏi',
    collectionJson: 'Debug: JSON Bộ Câu Hỏi',
  },
  questionBank: {
    title: 'Kho câu hỏi',
    subtitle: 'Duyệt và chọn câu hỏi',
    bankTypes: {
      personal: 'Kho cá nhân',
      application: 'Kho ứng dụng',
    },
    filters: {
      search: 'Tìm kiếm câu hỏi...',
      type: 'Loại câu hỏi',
      difficulty: 'Độ khó',
      subject: 'Môn học',
      grade: 'Khối lớp',
      chapter: 'Chương',
      clearFilters: 'Xóa bộ lọc',
      allTypes: 'Tất cả loại',
      allDifficulties: 'Tất cả độ khó',
      allSubjects: 'Tất cả môn',
      noChapters: 'Không có chương',
    },
    selection: {
      selected: '{{count}} đã chọn',
      addSelected: 'Thêm đã chọn ({{count}})',
      copySelected: 'Sao chép đã chọn ({{count}})',
      copyToPersonal: 'Sao chép {{count}} vào kho cá nhân',
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
      selected: 'Đã chọn',
      applicationBadge: 'Chỉ đọc',
      untitled: 'Câu hỏi chưa có tiêu đề',
    },
    subjects: {
      toan: 'Toán',
      tiengViet: 'Tiếng việt',
      tiengAnh: 'Tiếng anh',
    },
  },
  shared: {
    imageUploader: {
      label: 'Hình ảnh',
      uploadButton: 'Tải lên hình ảnh',
      uploading: 'Đang tải lên...',
      preview: 'Xem trước',
      uploadError: 'Không thể tải lên hình ảnh',
      chooseFromStorage: 'Chọn từ kho lưu trữ',
    },
    imageStorageDialog: {
      title: 'Chọn hình ảnh từ kho lưu trữ',
      description: 'Chọn hình ảnh từ những hình ảnh đã tải lên trước đây',
      searchPlaceholder: 'Tìm kiếm hình ảnh...',
      noImages: 'Không tìm thấy hình ảnh',
      imageAlt: 'Hình ảnh trong kho',
      loadMore: 'Tải thêm',
      loadingMore: 'Đang tải...',
      cancel: 'Hủy',
      select: 'Chọn hình ảnh',
    },
  },
  editing: {
    shuffle: {
      shuffleOptions: 'Xáo trộn lựa chọn',
      shuffleOptionsDescription: 'Ngẫu nhiên hóa thứ tự các lựa chọn cho mỗi học sinh',
      shufflePairs: 'Xáo trộn cặp',
      shufflePairsDescription: 'Ngẫu nhiên hóa thứ tự các cặp ghép cho mỗi học sinh',
      shuffleQuestions: 'Xáo trộn câu hỏi',
      shuffleQuestionsDescription: 'Ngẫu nhiên hóa thứ tự các câu hỏi cho mỗi học sinh',
    },
    multipleChoice: {
      title: 'Chỉnh sửa câu hỏi trắc nghiệm',
      alerts: {
        minOptions: 'Phải có ít nhất 2 lựa chọn',
      },
      labels: {
        question: 'Câu hỏi',
        questionImage: 'Hình ảnh câu hỏi (tùy chọn)',
        options: 'Các lựa chọn',
        explanation: 'Giải thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập câu hỏi của bạn...',
        option: 'Nhập nội dung lựa chọn...',
        explanation: 'Giải thích câu trả lời đúng...',
      },
      buttons: {
        addOption: 'Thêm lựa chọn',
        removeImage: 'Xóa hình ảnh',
        addImage: 'Thêm hình ảnh',
      },
    },
    matching: {
      title: 'Chỉnh sửa câu hỏi nối',
      alerts: {
        minPairs: 'Phải có ít nhất 2 cặp',
      },
      labels: {
        question: 'Câu hỏi',
        questionImage: 'Hình ảnh câu hỏi (tùy chọn)',
        matchingPairs: 'Các cặp ghép',
        left: 'Trái',
        right: 'Phải',
        explanation: 'Giải thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập hướng dẫn câu hỏi nối...',
        leftItem: 'Mục bên trái...',
        rightItem: 'Mục bên phải...',
        explanation: 'Giải thích các cặp ghép đúng...',
      },
      buttons: {
        addPair: 'Thêm cặp',
        addImage: 'Thêm hình ảnh',
        removeImage: 'Xóa hình ảnh',
      },
      pair: 'Cặp {{number}}',
    },
    openEnded: {
      title: 'Chỉnh sửa câu hỏi tự luận',
      labels: {
        question: 'Câu hỏi',
        questionImage: 'Hình ảnh câu hỏi (tùy chọn)',
        maxLength: 'Độ dài tối đa câu trả lời',
        expectedAnswer: 'Câu trả lời mong đợi (tùy chọn)',
        explanation: 'Giải thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        question: 'Nhập câu hỏi của bạn...',
        expectedAnswer: 'Nhập câu trả lời mẫu/mong đợi để tham khảo...',
        explanation: 'Giải thích câu trả lời hay là như thế nào...',
      },
      maxLengthInfo: '{{length}} ký tự (0 = không giới hạn)',
    },
    fillInBlank: {
      title: 'Chỉnh sửa câu hỏi điền vào chỗ trống',
      alerts: {
        minSegments: 'Phải có ít nhất 1 đoạn',
      },
      labels: {
        title: 'Tiêu đề (tùy chọn)',
        caseSensitive: 'Phân biệt hoa thường',
        titleImage: 'Hình ảnh tiêu đề (tùy chọn)',
        questionSegments: 'Các đoạn câu hỏi',
        alternativeAnswers: 'Câu trả lời thay thế',
        preview: 'Xem trước:',
        explanation: 'Giải thích (hiển thị sau đánh giá)',
      },
      placeholders: {
        title: 'Nhập tiêu đề hoặc hướng dẫn...',
        text: 'Nhập văn bản...',
        correctAnswer: 'Câu trả lời đúng...',
        alternative: 'Câu trả lời thay thế...',
        explanation: 'Giải thích các câu trả lời đúng...',
      },
      buttons: {
        addText: 'Thêm văn bản',
        addBlank: 'Thêm chỗ trống',
        add: 'Thêm',
      },
      segmentTypes: {
        text: 'Văn bản',
        blank: 'Chỗ trống',
      },
    },
  },
  assignmentEditor: {
    // Tiêu đề trang
    pageTitle: {
      create: 'Tạo bài tập mới',
      edit: 'Chỉnh sửa bài tập',
    },

    // Nút hành động chính
    actions: {
      actions: 'Hành động',
      cancel: 'Hủy',
      save: 'Lưu bài tập',
      saving: 'Đang lưu...',
      tooltips: {
        save: 'Lưu thay đổi',
        generate: 'Tạo bằng AI (sắp có)',
        fromBank: 'Thêm từ kho câu hỏi',
      },
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
      panelTitle: 'Câu hỏi',
      title: 'Câu hỏi',
      stats: '{{count}} câu hỏi (tổng {{points}} điểm)',
      stats_plural: '{{count}} câu hỏi (tổng {{points}} điểm)',
      addFromBank: 'Thêm từ kho',
      toolbar: {
        addQuestion: 'Thêm câu hỏi',
        generate: 'Tạo tự động',
        fromBank: 'Từ kho',
        previewMode: 'Chế độ xem trước',
        editMode: 'Chế độ chỉnh sửa',
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
        hint: 'Nhấp "Thêm câu hỏi" để bắt đầu',
        title: 'Chưa có câu hỏi nào',
        description: 'Bắt đầu xây dựng bài tập bằng cách thêm câu hỏi từ kho câu hỏi',
      },
    },

    // Bảng điều khiển thông tin bài tập
    metadata: {
      panelTitle: 'Thông tin bài tập',
      edit: 'Chỉnh sửa',
      title: 'Thông tin bài tập',
      fields: {
        title: 'Tiêu đề',
        subject: 'Môn học',
        grade: 'Khối',
        class: 'Lớp',
        description: 'Mô tả',
        dueDate: 'Hạn nộp',
        shuffleQuestions: 'Xáo trộn câu hỏi',
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
      tooltips: {
        title: 'Đặt tên bài tập',
        subject: 'Chọn môn học',
        grade: 'Chọn khối lớp',
        description: 'Thêm hướng dẫn (tùy chọn)',
        shuffleQuestions: 'Xáo trộn câu hỏi mỗi học sinh',
      },
    },

    // Hộp thoại chỉnh sửa thông tin
    metadataDialog: {
      title: 'Chỉnh sửa thông tin bài tập',
      description: 'Cập nhật thông tin bài tập. Các thay đổi sẽ được lưu tự động khi bạn đóng hộp thoại này.',
      fields: {
        title: 'Tiêu đề',
        subject: 'Môn học',
        grade: 'Khối',
        description: 'Mô tả',
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
      panelTitle: 'Ma trận đánh giá',
      view: 'Xem',
      edit: 'Chỉnh sửa',
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
      title: 'Chỉnh sửa ma trận đánh giá',
      description:
        'Cấu hình các chủ đề và số lượng câu hỏi yêu cầu cho mỗi mức độ khó. Các thay đổi sẽ được lưu tự động.',
      topicsLabel: 'Chủ đề',
      addTopic: 'Thêm chủ đề',
      editTopic: 'Chỉnh sửa chủ đề',
      editTopicDescription: 'Cập nhật tên và mô tả chủ đề',
      topicName: 'Tên chủ đề',
      topicDescription: 'Mô tả chủ đề',
      topicPlaceholder: 'Tên chủ đề...',
      descriptionPlaceholder: 'Mô tả chủ đề (tùy chọn)...',
      deleteTopic: 'Xóa chủ đề',
      emptyMessage: 'Thêm chủ đề để xem ma trận',
      done: 'Xong',
      cancel: 'Hủy',
      save: 'Lưu',
      tableHeaders: {
        topic: 'Chủ đề',
      },
    },

    // Bảng xây dựng ma trận
    matrixBuilder: {
      panelTitle: 'Bảng ma trận đánh giá',
      description:
        'Cấu hình chủ đề và số lượng câu hỏi yêu cầu cho mỗi mức độ khó. Thay đổi được lưu tự động.',
      tooltips: {
        addTopic: 'Thêm chủ đề mới',
        editTopic: 'Sửa thông tin chủ đề',
        cellInput: 'Số câu hỏi yêu cầu',
      },
    },

    // Hộp thoại xem ma trận
    matrixView: {
      title: 'Ma trận đánh giá',
      description: 'Xem ma trận đánh giá đầy đủ hiển thị số câu hỏi yêu cầu và hiện tại.',
      summary: {
        topics: '{{count}} chủ đề',
        topics_plural: '{{count}} chủ đề',
        questions: '{{count}} câu hỏi',
        questions_plural: '{{count}} câu hỏi',
      },
      legend: {
        valid: 'Hợp lệ',
        warning: 'Cảnh báo',
        empty: 'Trống',
      },
      tableHeaders: {
        topic: 'Chủ đề',
        total: 'Tổng',
      },
      close: 'Đóng',
    },

    // Thông tin cơ bản bài tập
    basicInfo: {
      title: 'Thông tin bài tập',
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
      count: '{{count}} câu hỏi',
      count_plural: '{{count}} câu hỏi',
    },

    // Chuyển đổi chế độ xem
    viewModeToggle: {
      preview: 'Xem trước',
      edit: 'Chỉnh sửa',
    },

    // Điều hướng câu hỏi
    navigator: {
      questionsCount: '{{count}} câu hỏi',
      questionsCount_plural: '{{count}} câu hỏi',
      listView: 'Xem danh sách',
      assignmentInfo: 'Thông tin bài tập',
      matrixBuilder: 'Ma trận',
      untitled: 'Chưa có tiêu đề',
      tooltips: {
        assignmentInfo: 'Sửa thông tin bài tập',
        matrixBuilder: 'Cấu hình ma trận đánh giá',
        questionNumber: 'Nhấp để sửa, kéo để sắp xếp',
      },
    },

    // Ô ma trận
    matrixCell: {
      required: 'Yêu cầu:',
      ok: 'OK',
    },

    // Xem câu hỏi hiện tại
    currentQuestion: {
      panelTitle: 'Câu {{number}}',
      dataMissing: 'Thiếu dữ liệu câu hỏi',
      questionOf: 'Câu hỏi {{current}} trên {{total}}',
      edit: 'Chỉnh sửa',
      preview: 'Xem trước',
      noQuestions: 'Chưa có câu hỏi',
      addQuestionHint: 'Nhấn "Thêm câu hỏi" để bắt đầu',
    },

    // Danh sách câu hỏi
    questionsList: {
      emptyTitle: 'Chưa có câu hỏi',
      emptyHint: 'Nhấn "Thêm câu hỏi" để bắt đầu',
    },

    // Điều hướng câu hỏi
    questionNavigator: {
      questionCount: '{{count}} câu hỏi',
      questionCount_plural: '{{count}} câu hỏi',
      assignmentInfo: 'Thông tin bài tập',
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
      copyQuestion: 'Sao chép câu hỏi',
    },
    importQuestions: {
      title: 'Nhập câu hỏi từ CSV',
      description: 'Tải lên tệp CSV chứa các câu hỏi để nhập vào kho câu hỏi cá nhân.',
      downloadTemplate: 'Tải xuống mẫu CSV',
      uploadPlaceholder: 'Nhấp để tải lên hoặc kéo thả',
      fileTypeInfo: 'Chỉ chấp nhận tệp CSV',
      successMessage: 'Đã nhập thành công {{count}} câu hỏi',
      errorMessage: 'Nhập hoàn tất có lỗi: {{success}} thành công, {{failed}} thất bại',
      errorDetails: 'Chi tiết lỗi:',
      moreErrors: '... và {{count}} lỗi khác',
      formatRequirements: 'Yêu cầu định dạng CSV:',
      requirement1: 'Hàng đầu tiên phải chứa tiêu đề: type, title, difficulty, subject, points, content',
      requirement2: 'type phải là một trong: multipleChoice, matching, openEnded, fillInBlank',
      requirement3: 'difficulty phải là một trong: nhanBiet, thongHieu, vanDung, vanDungCao',
      requirement4: 'subject phải là một trong: toan, tiengViet, tiengAnh',
      requirement5: 'content phải là JSON hợp lệ cho loại câu hỏi tương ứng',
      close: 'Đóng',
      cancel: 'Hủy',
      importing: 'Đang nhập...',
      importQuestions: 'Nhập câu hỏi',
    },
    questionForm: {
      titleCreate: 'Tạo câu hỏi mới',
      titleEdit: 'Chỉnh sửa câu hỏi',
      metadataSection: 'Thông tin câu hỏi',
      contentSection: 'Nội dung câu hỏi',
      validationErrors: 'Lỗi xác thực',
      labels: {
        questionType: 'Loại câu hỏi',
        subject: 'Môn học',
        difficulty: 'Độ khó',
        points: 'Điểm',
      },
      questionTypes: {
        multipleChoice: 'Trắc nghiệm',
        matching: 'Nối',
        openEnded: 'Tự luận',
        fillInBlank: 'Điền vào chỗ trống',
      },
      subjects: {
        math: 'Toán',
        vietnamese: 'Tiếng việt',
        english: 'Tiếng anh',
      },
      difficulties: {
        nhanBiet: 'Nhận biết',
        thongHieu: 'Thông hiểu',
        vanDung: 'Vận dụng',
        vanDungCao: 'Vận dụng cao',
      },
      buttons: {
        cancel: 'Hủy',
        create: 'Tạo câu hỏi',
        save: 'Lưu thay đổi',
      },
      errors: {
        missingData: 'Thiếu dữ liệu câu hỏi',
        validationFailed: 'Vui lòng sửa các lỗi xác thực trước khi lưu',
      },
    },
    unsavedChanges: {
      title: 'Thay đổi chưa lưu',
      description: 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?',
      stay: 'Ở lại',
      leave: 'Rời đi',
    },
    deleteAssignment: {
      title: 'Xóa bài tập?',
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

  viewer: {
    metadata: {
      panelTitle: 'Thông tin bài tập',
      fields: {
        title: 'Tiêu đề',
        subject: 'Môn học',
        grade: 'Khối',
        description: 'Mô tả',
        shuffleQuestions: 'Xáo trộn câu hỏi',
        createdAt: 'Tạo ngày',
      },
    },
    questions: {
      panelTitle: 'Câu {{number}}',
      topic: 'Chủ đề',
      difficulty: 'Độ khó',
      points: 'Điểm',
      noQuestions: 'Không có câu hỏi',
      noQuestionsDescription: 'Bài tập này chưa có câu hỏi nào.',
      noQuestionSelected: 'Chưa chọn câu hỏi',
      selectQuestion: 'Chọn một câu hỏi để xem',
    },
    matrix: {
      panelTitle: 'Ma trận đánh giá',
      viewDescription: 'Ma trận này hiển thị phân bố câu hỏi theo chủ đề và mức độ khó.',
    },
    navigator: {
      questionsCount: 'Câu hỏi ({{count}})',
      assignmentInfo: 'Thông tin bài tập',
      matrixBuilder: 'Ma trận đánh giá',
    },
    actions: {
      title: 'Hành động',
      edit: 'Chỉnh sửa bài tập',
      delete: 'Xóa bài tập',
    },
  },

  view: {
    pageTitle: 'Xem bài tập',
    notFound: 'Không tìm thấy bài tập',
    notFoundDescription: 'Bài tập bạn đang tìm không tồn tại hoặc đã bị xóa.',
    noDescription: 'Chưa có mô tả',
    noQuestions: 'Chưa có câu hỏi',
    noQuestionsDescription: 'Bài tập này chưa có câu hỏi nào.',
    noMatrix: 'Chưa có ma trận đánh giá',
    noMatrixDescription: 'Bài tập này chưa được cấu hình ma trận đánh giá.',
    deleteSuccess: 'Xóa bài tập thành công',
    deleteError: 'Không thể xóa bài tập',

    tabs: {
      overview: 'Tổng quan',
      questions: 'Câu hỏi',
    },

    status: {
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ',
    },

    metadata: {
      totalQuestions: '{{count}} câu hỏi',
      totalQuestions_plural: '{{count}} câu hỏi',
      totalPoints: '{{points}} điểm',
      createdAt: 'Tạo ngày {{date}}',
    },

    actions: {
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
    },

    deleteDialog: {
      title: 'Xóa bài tập?',
      description: 'Hành động này không thể hoàn tác. Bài tập và tất cả câu hỏi sẽ bị xóa vĩnh viễn.',
      cancel: 'Hủy',
      delete: 'Xóa',
    },

    overview: {
      totalQuestions: 'Tổng số câu hỏi',
      totalPoints: 'Tổng điểm',
      status: 'Trạng thái',
      description: 'Mô tả',
      questionsByType: 'Câu hỏi theo loại',
      questionsByDifficulty: 'Câu hỏi theo độ khó',
    },

    questions: {
      title: '{{count}} câu hỏi',
      title_plural: '{{count}} câu hỏi',
      totalPoints: 'Tổng {{points}} điểm',
      questionNumber: 'Câu {{number}}',
      points: '{{points}} điểm',
    },
  },
};
