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
      noTopic: 'Không',
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
      hasContext: 'Có đoạn văn đọc hiểu',
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
        generate: 'Tạo câu hỏi bằng AI',
        generateMatrix: 'Tạo ma trận đánh giá bằng AI',
        fromBank: 'Thêm từ kho câu hỏi',
        addContext: 'Tạo đoạn văn mới',
        fromLibrary: 'Nhập từ thư viện đoạn văn',
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
      questionsHaveErrors: '{{count}} câu hỏi có lỗi cần sửa',
      assignmentFieldsRequired: 'Vui lòng điền các trường bắt buộc của bài tập',
      multipleErrors: 'Vui lòng sửa {{count}} câu hỏi có lỗi và điền các trường bắt buộc',
      matrixNotFulfilled: '{{count}} ô ma trận chưa đủ số lượng câu hỏi',
    },

    // Thông báo toast
    toasts: {
      createSuccess: 'Đã tạo bài tập thành công!',
      updateSuccess: 'Đã cập nhật bài tập thành công!',
      saveError: 'Không thể lưu bài tập',
      noTopicError: 'Vui lòng thêm ít nhất một chủ đề trước khi thêm câu hỏi từ ngân hàng',
      questionsAdded: 'Đã thêm {{count}} câu hỏi vào bài tập',
      contextFetchError: 'Không thể tải đoạn văn đọc hiểu cho câu hỏi đã nhập',

      // Submission-related
      submitSuccess: 'Nộp bài thành công!',
      submitError: 'Không thể nộp bài: {{message}}',
      gradingSaved: 'Lưu điểm thành công!',
      gradingError: 'Không thể lưu điểm: {{message}}',
      submissionDeleted: 'Đã xóa bài nộp thành công!',
      submissionDeleteError: 'Không thể xóa bài nộp: {{message}}',
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
        generate: 'Tạo sinh',
        fromBank: 'Từ kho',
        previewMode: 'Chế độ xem trước',
        editMode: 'Chế độ chỉnh sửa',
        tooltips: {
          addQuestion: 'Tạo câu hỏi mới',
          generate: 'Tạo câu hỏi bằng AI',
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
      addSubtopic: 'Thêm chủ đề con',
      parentTopic: 'Nhóm chủ đề',
      parentTopicPlaceholder: 'Tên nhóm chủ đề...',
      editGroup: 'Chỉnh sửa nhóm chủ đề',
      editGroupDescription: 'Đổi tên nhóm chủ đề. Tất cả chủ đề con trong nhóm này sẽ được cập nhật.',
      groupName: 'Tên nhóm',
      groupNamePlaceholder: 'Tên nhóm chủ đề...',
      deleteTopic: 'Xóa chủ đề',
      emptyMessage: 'Thêm chủ đề để xem ma trận',
      done: 'Xong',
      cancel: 'Hủy',
      save: 'Lưu',
      tableHeaders: {
        topic: 'Chủ đề',
      },
    },

    // Bảng quản lý đoạn văn
    contextsPanel: {
      panelTitle: 'Đoạn văn đọc hiểu',
      description: 'Tạo và quản lý các đoạn văn đọc hiểu có thể chia sẻ giữa các câu hỏi.',
      addContext: 'Thêm đoạn văn',
      emptyState: 'Chưa có đoạn văn nào. Tạo đoạn văn để gắn vào câu hỏi.',
      titleField: 'Tiêu đề',
      contentField: 'Nội dung',
      authorField: 'Tác giả (tùy chọn)',
      create: 'Tạo',
      cancel: 'Hủy',
      deleteConfirmTitle: 'Xóa đoạn văn',
      deleteConfirmDescription: 'Bạn có chắc muốn xóa "{{title}}"?',
      deleteConfirmWarning:
        'Đoạn văn này đang được {{count}} câu hỏi tham chiếu. Xóa sẽ ngắt kết nối các câu hỏi đó.',
      delete: 'Xóa',
      fromLibrary: 'Từ thư viện',
      fromLibraryTitle: 'Nhập từ thư viện',
      fromLibraryDescription: 'Duyệt đoạn văn từ thư viện và thêm vào bài tập này.',
      searchLibrary: 'Tìm trong thư viện...',
      loadingLibrary: 'Đang tải...',
      noLibraryContextFound: 'Không tìm thấy đoạn văn nào trong thư viện',
      import: 'Nhập',
      importSelected: 'Nhập đã chọn ({{count}})',
      alreadyAdded: 'Đã thêm',
    },

    // Hộp thoại nhập ngữ cảnh (hiển thị khi nhập câu hỏi có ngữ cảnh từ ngân hàng)
    importContextDialog: {
      title: 'Nhập đoạn văn đọc hiểu',
      description:
        'Một số câu hỏi đã chọn tham chiếu đến đoạn văn đọc hiểu chưa có trong bài tập này. Các đoạn văn này sẽ được thêm tự động.',
      passageCount: '{{count}} đoạn văn sẽ được thêm:',
      dontAskAgain: 'Không hỏi lại',
      cancel: 'Hủy',
      import: 'Nhập',
    },

    // Bảng xây dựng ma trận
    matrixBuilder: {
      panelTitle: 'Bảng ma trận đánh giá',
      description: 'Cấu hình chủ đề và số lượng câu hỏi yêu cầu cho mỗi mức độ khó. ',
      generateMatrix: 'Tạo ma trận',
      tooltips: {
        addTopic: 'Thêm chủ đề mới',
        addSubtopic: 'Thêm chủ đề con vào nhóm này',
        editGroup: 'Đổi tên nhóm chủ đề',
        editTopic: 'Sửa thông tin chủ đề',
        cellInput: 'Số câu hỏi yêu cầu',
        removeCell: 'Xóa ô',
        addCell: 'Thêm ô tiêu chí',
      },
    },

    // Hộp thoại tạo ma trận
    generateMatrixDialog: {
      title: 'Tạo ma trận đánh giá bằng AI',
      description: 'Sử dụng AI để tự động tạo ma trận đánh giá dựa trên yêu cầu của bạn.',
      presets: {
        label: 'Bắt đầu nhanh',
        quickQuiz: { label: 'Kiểm tra nhanh', description: '10 câu, độ khó cơ bản, chỉ trắc nghiệm' },
        standardTest: { label: 'Bài kiểm tra', description: '20 câu, tất cả độ khó, không tự luận' },
        comprehensiveExam: { label: 'Đề thi tổng hợp', description: '40 câu, tất cả độ khó, tất cả loại' },
      },
      fields: {
        name: 'Tên ma trận',
        namePlaceholder: 'Nhập tên ma trận',
        nameHelp: 'Một tên duy nhất để xác định ma trận này',
        grade: 'Khối lớp',
        gradePlaceholder: 'Chọn khối lớp',
        gradeHelp: 'Khối lớp sẽ ảnh hưởng đến độ khó và loại câu hỏi được đề xuất',
        subject: 'Môn học',
        subjectPlaceholder: 'Chọn môn học',
        subjectHelp: 'Lọc câu hỏi theo môn học để tạo ra ma trận phù hợp',
        totalQuestions: 'Tổng số câu hỏi',
        totalQuestionsHelp: 'Tổng số câu hỏi mà bạn muốn có trong ma trận',
        totalPoints: 'Tổng điểm',
        totalPointsHelp: 'Tổng điểm cho tất cả câu hỏi',
        difficulties: 'Mức độ khó',
        difficultiesHelp:
          'KIẾN THỨC: Nhớ lại thông tin. HIỂU BIẾT: Giải thích ý tưởng. ỨNG DỤNG: Sử dụng ý tưởng',
        questionTypes: 'Loại câu hỏi',
        questionTypesHelp:
          'TRẮC NGHIỆM: Chọn 1 câu trả lời. ĐIỀN ĐẠO: Điền từ/câu thiếu. GHÉP ĐÔI: Ghép cặp. TỰ LUẬN: Câu trả lời mở',
        prompt: 'Yêu cầu',
        promptPlaceholder: 'Mô tả những gì bạn muốn ma trận tập trung vào...',
        promptHelp: 'Ví dụ: "Tập trung vào chương 1-3", "Nhấn mạnh các ứng dụng thực tế"',
        language: 'Ngôn ngữ',
        languageVietnamese: 'Tiếng Việt',
        languageEnglish: 'English',
        languageHelp: 'Ngôn ngữ được sử dụng cho các chủ đề được tạo',
        model: 'Mô hình AI',
        modelPlaceholder: 'Chọn mô hình AI',
        modelHelp: 'Các mô hình khác nhau có tốc độ và độ chính xác khác nhau',
      },
      actions: {
        cancel: 'Hủy',
        generate: 'Tạo ma trận',
        generating: 'Đang tạo...',
      },
      toast: {
        success: 'Tạo ma trận thành công',
        error: 'Không thể tạo ma trận',
        noQuestionTypes: 'Vui lòng chọn ít nhất một loại câu hỏi',
        noDifficulties: 'Vui lòng chọn ít nhất một mức độ khó',
      },
      validation: {
        nameRequired: 'Tên ma trận là bắt buộc',
        gradeRequired: 'Khối lớp là bắt buộc',
        subjectRequired: 'Môn học là bắt buộc',
        totalQuestionsRequired: 'Tổng số câu hỏi phải ít nhất là 1',
        totalPointsRequired: 'Tổng điểm phải ít nhất là 1',
      },
      confirmation: {
        title: 'Tạo ma trận thành công',
        description: 'Bạn muốn áp dụng ma trận đã tạo như thế nào?',
        summary: '{{topicCount}} chủ đề, {{totalQuestions}} câu hỏi, {{totalPoints}} điểm',
        replaceWarning:
          'Cảnh báo: Chế độ thay thế sẽ xóa {{count}} câu hỏi hiện tại được gán cho các chủ đề.',
        replace: 'Thay thế',
        merge: 'Gộp',
        cancel: 'Hủy',
      },
      summary: {
        willGenerate:
          'Sẽ tạo ~{{questions}} câu hỏi (~{{points}} điểm) trên {{difficulties}} mức độ khó và {{types}} loại câu hỏi',
        warnings: {
          largeMatrix: 'Ma trận lớn có thể mất nhiều thời gian hơn để tạo',
        },
        info: {
          singleDifficulty: 'Hãy xem xét thêm nhiều mức độ khó để tạo đa dạng',
          emptyPrompt: 'Hãy thêm bối cảnh để kết quả tốt hơn',
        },
      },
      savePreset: {
        title: 'Lưu cấu hình là mẫu',
        description: 'Lưu cấu hình hiện tại để sử dụng lại sau này',
        fields: {
          name: 'Tên mẫu',
          namePlaceholder: 'Nhập tên mẫu (tối đa 50 ký tự)',
          description: 'Mô tả',
          descriptionPlaceholder: 'Mô tả ngắn về mẫu này (tùy chọn)',
          icon: 'Biểu tượng',
        },
        errors: {
          nameRequired: 'Tên mẫu là bắt buộc',
          nameTooLong: 'Tên mẫu không được vượt quá 50 ký tự',
        },
        save: 'Lưu mẫu',
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
      contexts: 'Đoạn văn đọc hiểu',
      untitled: 'Chưa có tiêu đề',
      tooltips: {
        assignmentInfo: 'Sửa thông tin bài tập',
        matrixBuilder: 'Cấu hình ma trận đánh giá',
        contexts: 'Quản lý đoạn văn đọc hiểu',
        questionNumber: 'Nhấp để sửa, kéo để sắp xếp',
      },
    },

    // Ô ma trận
    matrixCell: {
      required: 'Yêu cầu:',
      ok: 'OK',
      needMore: 'Cần thêm {{count}}',
      extra: 'Thừa {{count}}',
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
      noQuestionSelected: 'Chưa chọn câu hỏi',
      selectQuestionHint: 'Chọn một câu hỏi từ thanh điều hướng để chỉnh sửa',
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

  generatedQuestions: {
    title: 'Câu hỏi đã tạo',
    subtitle: 'Xem lại và quản lý các câu hỏi được tạo bởi AI',
    summary: 'Đã tạo thành công {{count}} câu hỏi',
    promptLabel: 'Mô tả',
    noQuestions: 'Không có câu hỏi được tạo để hiển thị',
    backToQuestionBank: 'Quay lại ngân hàng câu hỏi',
    generateMore: 'Tạo thêm',
    toast: {
      deleteSuccess: 'Xóa câu hỏi thành công',
      deleteError: 'Không thể xóa câu hỏi',
    },
    actions: {
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      deleteSelected: 'Xóa đã chọn',
    },
    dialogs: {
      delete: {
        description: 'Bạn có chắc chắn muốn xóa {{count}} câu hỏi? Hành động này không thể hoàn tác.',
      },
    },
    selectedCount: '{{count}} câu hỏi đã chọn',
  },

  teacherQuestionBank: {
    title: 'Ngân hàng câu hỏi của tôi',
    subtitle: 'Quản lý thư viện câu hỏi cá nhân',

    actions: {
      create: 'Tạo câu hỏi',
      import: 'Nhập CSV',
      export: 'Xuất CSV',
      generate: 'Tạo bằng AI',
      edit: 'Chỉnh sửa',
      duplicate: 'Nhân bản',
      delete: 'Xóa',
      deleteSelected: 'Xóa đã chọn',
      copyToPersonal: 'Sao chép vào kho cá nhân',
      browsePublic: 'Duyệt câu hỏi công khai',
    },

    generate: {
      title: 'Tạo câu hỏi bằng AI',
      description: 'Sử dụng AI để tự động tạo câu hỏi theo yêu cầu của bạn.',
      fields: {
        prompt: 'Mô tả',
        promptPlaceholder: 'Mô tả nội dung câu hỏi cần tạo (ví dụ: "Phép cộng trừ trong phạm vi 20")',
        promptHelp: 'Hãy cụ thể về nội dung mà câu hỏi cần đề cập',
        grade: 'Khối lớp',
        gradePlaceholder: 'Chọn khối',
        subject: 'Môn học',
        subjectPlaceholder: 'Chọn môn',
        chapter: 'Chương',
        chapterPlaceholder: 'Chọn chương (tùy chọn)',
        chapterHelp: 'Câu hỏi được tạo sẽ phù hợp hơn nếu bạn chỉ định chương',
        questionTypes: 'Loại câu hỏi',
        questionTypesHelp: 'Chọn ít nhất một loại câu hỏi để tạo',
        questionsPerDifficulty: 'Số câu theo độ khó',
        difficultyKnowledge: 'Nhận biết',
        difficultyComprehension: 'Thông hiểu',
        difficultyApplication: 'Vận dụng',
        model: 'Mô hình AI',
        modelPlaceholder: 'Chọn mô hình (tùy chọn)',
        total: 'Tổng:',
        questionSingular: 'câu hỏi',
        questionPlural: 'câu hỏi',
        largeGenerationWarning: 'Tạo nhiều câu hỏi có thể mất nhiều thời gian',
      },
      tooltips: {
        prompt: 'Mô tả chủ đề, chương, hoặc nội dung cụ thể bạn muốn tạo câu hỏi',
        chapter: 'Thu hẹp câu hỏi theo chương cụ thể trong chương trình học',
        questionTypes: 'Chọn định dạng câu hỏi cần tạo',
        questionsPerDifficulty: 'Đặt số lượng câu hỏi cho mỗi mức độ khó',
        model: 'Chọn mô hình AI để tạo câu hỏi',
      },
      questionTypes: {
        MULTIPLE_CHOICE: 'Trắc nghiệm',
        MATCHING: 'Nối',
        FILL_IN_BLANK: 'Điền vào chỗ trống',
        OPEN_ENDED: 'Tự luận',
      },
      actions: {
        cancel: 'Hủy',
        generate: 'Tạo câu hỏi',
        generating: 'Đang tạo...',
      },
      toast: {
        success: 'Đã tạo thành công {{count}} câu hỏi',
        error: 'Không thể tạo câu hỏi',
        noQuestionTypes: 'Vui lòng chọn ít nhất một loại câu hỏi',
        noQuestionsRequested: 'Vui lòng chỉ định ít nhất một câu hỏi cần tạo',
      },
      validation: {
        promptRequired: 'Mô tả là bắt buộc',
        gradeRequired: 'Khối lớp là bắt buộc',
        subjectRequired: 'Môn học là bắt buộc',
        questionTypesRequired: 'Cần chọn ít nhất một loại câu hỏi',
        questionsRequired: 'Cần yêu cầu ít nhất một câu hỏi',
      },
      footer: {
        readyToGenerate: 'Sẵn sàng tạo:',
        questionSingular: 'câu hỏi',
        questionPlural: 'câu hỏi',
        typeSingular: 'loại',
        typePlural: 'loại',
        validationRequired: 'Vui lòng điền tất cả các trường bắt buộc trước khi tạo',
      },
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

  questionBankView: {
    pageTitle: 'Chi Tiết Câu Hỏi',
    sections: {
      metadata: 'Thông Tin Câu Hỏi',
      content: 'Nội Dung Câu Hỏi',
      explanation: 'Giải Thích',
      context: 'Bài Đọc',
    },
    fields: {
      title: 'Tiêu đề',
      subject: 'Môn học',
      grade: 'Lớp',
      type: 'Loại câu hỏi',
      difficulty: 'Độ khó',
      chapter: 'Chương',
      createdAt: 'Ngày tạo',
      updatedAt: 'Ngày cập nhật',
    },
    actions: {
      title: 'Hành động',
      edit: 'Chỉnh sửa',
      duplicate: 'Nhân bản',
      delete: 'Xóa câu hỏi',
    },
    toast: {
      deleteSuccess: 'Xóa câu hỏi thành công',
      deleteError: 'Không thể xóa câu hỏi',
      duplicateSuccess: 'Nhân bản câu hỏi thành công',
      duplicateError: 'Không thể nhân bản câu hỏi',
    },
    deleteDialog: {
      title: 'Xóa câu hỏi?',
      description: 'Hành động này không thể hoàn tác. Câu hỏi sẽ bị xóa vĩnh viễn.',
      cancel: 'Hủy',
      delete: 'Xóa',
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
      listView: 'Xem danh sách',
      assignmentInfo: 'Thông tin bài tập',
      matrixBuilder: 'Ma trận đánh giá',
      contexts: 'Đoạn văn bản',
    },
    actions: {
      title: 'Hành động',
      edit: 'Chỉnh sửa bài tập',
      viewQuestionsList: 'Xem danh sách câu hỏi',
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

  context: {
    readingPassage: 'Đoạn văn đọc hiểu',
    collapse: 'Thu gọn',
    expand: 'Mở rộng',
    edit: 'Chỉnh sửa',
    preview: 'Xem trước',
    selectContext: 'Chọn đoạn văn đọc hiểu...',
    searchContext: 'Tìm kiếm đoạn văn...',
    loading: 'Đang tải...',
    noContextFound: 'Không tìm thấy đoạn văn nào',
    contextLabel: 'Đoạn văn đọc hiểu',
    noContext: 'Không có',
    questionInGroup: 'Câu {{current}}/{{total}} (Câu {{number}})',
    points: 'điểm',
    questionsCount: '{{count}} câu hỏi',
    contextGroupEditTip: 'Nhấn vào số câu hỏi trong thanh điều hướng để chỉnh sửa riêng từng câu.',
    titlePlaceholder: 'Nhập tiêu đề đoạn văn...',
    contentPlaceholder: 'Nhập nội dung đoạn văn...',
    authorPlaceholder: 'Tác giả (tùy chọn)',
    done: 'Xong',
    disconnect: 'Ngắt kết nối đoạn văn',
    assignmentOnlyHint: 'Thay đổi chỉ áp dụng cho bài tập này.',
  },

  submissions: {
    // Trạng thái nộp bài
    status: {
      graded: 'Đã chấm',
      submitted: 'Đã nộp',
      inProgress: 'Đang làm',
      pending: 'Chờ xử lý',
    },

    // Hành động chung
    actions: {
      back: 'Quay lại',
      goBack: 'Quay lại',
      viewResult: 'Xem kết quả',
      newAttempt: 'Thử lại',
      startAssignment: 'Bắt đầu làm bài',
      submit: 'Nộp bài',
      submitting: 'Đang nộp...',
      grade: 'Chấm điểm',
      view: 'Xem',
      save: 'Lưu điểm',
      saving: 'Đang lưu...',
      cancel: 'Hủy',
      previous: 'Trước',
      next: 'Tiếp',
    },

    // Trang nộp bài của học sinh
    studentSubmissions: {
      notFound: 'Không tìm thấy bài tập',
      previewMode: 'Chế độ xem trước: Truy cập qua bài tập của lớp để xem các bài nộp',
      due: 'Hạn nộp:',
      points: 'điểm',
      totalSubmissions: 'Tổng số bài nộp',
      max: 'Tối đa:',
      bestScore: 'Điểm cao nhất',
      latestStatus: 'Trạng thái mới nhất',
      score: 'Điểm:',
      previewModeButton: 'Chế độ xem trước',
      maxSubmissionsReached: 'Đã đạt số lần nộp tối đa',
      attemptsUsed: 'lần thử đã dùng',
      submissionHistory: 'Lịch sử nộp bài',
      noSubmissions: 'Chưa có bài nộp',
      startFirstAttempt: 'Bắt đầu lần thử đầu tiên để hoàn thành bài tập này',
      accessThroughHomework: 'Truy cập qua bài tập của lớp để nộp bài',
      attempt: 'Lần thử #{{number}}',
      latest: 'Mới nhất',
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      submission: 'bài nộp',
      submission_plural: 'bài nộp',
      best: 'Cao nhất:',
    },

    // Trang danh sách bài nộp (dành cho giáo viên)
    assignmentSubmissions: {
      title: 'Bài nộp',
      notFound: 'Không tìm thấy bài tập',
      totalSubmissions: 'Tổng số bài nộp',
      graded: 'Đã chấm',
      pendingReview: 'Chờ duyệt',
      averageScore: 'Điểm trung bình',
      notAvailable: 'N/A',
      waitingForReview: 'đang chờ duyệt',
      noSubmissions: 'Chưa có bài nộp',
      studentsHaventSubmitted: 'Học sinh chưa nộp bài',
      tableHeaders: {
        student: 'Học sinh',
        submitted: 'Đã nộp',
        status: 'Trạng thái',
        score: 'Điểm',
        actions: 'Thao tác',
      },
      unknownStudent: 'Học sinh không xác định',
      notGraded: 'Chưa chấm',
      previewMode: 'Chế độ xem trước: Truy cập qua bài đăng cụ thể để xem bài nộp',
    },

    // Trang kết quả bài nộp (học sinh xem)
    result: {
      notFound: 'Không tìm thấy bài nộp',
      yourGradedSubmission: 'Bài nộp đã được chấm của bạn',
      notGraded: 'Chưa chấm',
      excellent: 'Xuất sắc!',
      greatJob: 'Làm tốt lắm!',
      goodWork: 'Làm tốt!',
      keepPracticing: 'Tiếp tục luyện tập!',
      questions: 'Câu hỏi',
      totalPoints: 'Tổng điểm',
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      gradedBy: 'Chấm bởi',
      question: 'Câu hỏi',
      points: 'điểm',
      youEarned: 'Bạn đạt:',
      teacherFeedback: 'Nhận xét của giáo viên',
      overallFeedback: 'Nhận xét chung từ giáo viên',
    },

    // Trang làm bài (học sinh làm bài)
    doing: {
      notFound: 'Không tìm thấy bài tập',
      of: 'của',
      complete: '% hoàn thành',
      due: 'Hạn nộp:',
      points: 'điểm',
      progress: 'Tiến độ',
      answered: 'đã trả lời',
      question: 'Câu hỏi',
      questions: 'Câu hỏi',
      questionAnswered: 'Câu hỏi {{number}} (Đã trả lời)',
      answerAllQuestions: 'Vui lòng trả lời tất cả câu hỏi trước khi nộp',
      cannotSubmit: 'Không thể nộp: Bài tập này phải được truy cập qua bài tập của lớp',
      someQuestionsUnanswered: 'Một số câu hỏi chưa được trả lời',
      reviewBeforeSubmit: 'Vui lòng xem lại và trả lời tất cả câu hỏi trước khi nộp.',
      submitDialog: {
        title: 'Nộp bài tập?',
        description:
          'Bạn có chắc chắn muốn nộp bài tập này? Bạn sẽ không thể thay đổi câu trả lời sau khi nộp.',
        totalQuestions: 'Tổng số câu hỏi:',
        answered: 'Đã trả lời:',
        totalPoints: 'Tổng điểm:',
        previewMode: 'Chế độ xem trước: Truy cập qua bài tập của lớp để nộp',
      },
    },

    // Trang chấm điểm (giáo viên)
    grading: {
      title: 'Chấm bài nộp',
      notFound: 'Không tìm thấy bài nộp',
      graded: 'đã chấm',
      submitted: 'Đã nộp',
      gradingProgress: 'Tiến độ chấm bài',
      currentScore: 'Điểm hiện tại',
      overallFeedback: 'Nhận xét chung (Tùy chọn)',
      feedbackDescription: 'Đưa ra nhận xét chung về bài làm của học sinh',
      overallFeedbackPlaceholder: 'Làm tốt lắm! Em đã thể hiện sự hiểu biết tốt...',
      gradeAllQuestions: 'Chấm tất cả câu hỏi trước khi lưu',
      pleaseGradeAll: 'Vui lòng chấm tất cả câu hỏi (còn {{count}} câu)',
      question: 'Câu hỏi',
      worth: 'Điểm',
      points: 'điểm',
      grading: 'Chấm điểm',
      pointsAwarded: 'Điểm đạt được',
      outOf: 'trong tổng số',
      feedbackForQuestion: 'Nhận xét cho câu này (Tùy chọn)',
      questionFeedbackPlaceholder: 'Thêm nhận xét cụ thể về câu trả lời này...',
    },
  },
};
