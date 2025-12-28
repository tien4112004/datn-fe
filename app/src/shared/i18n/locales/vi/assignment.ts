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
      clearFilters: 'Xóa Bộ Lọc',
      allTypes: 'Tất Cả Loại',
      allDifficulties: 'Tất Cả Độ Khó',
      allSubjects: 'Tất Cả Môn',
    },
    selection: {
      selected: '{{count}} đã chọn',
      addSelected: 'Thêm Đã Chọn ({{count}})',
      copyToPersonal: 'Sao chép {{count}} vào Kho Cá Nhân',
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
    title: 'Soạn Bài Tập',
    createNew: 'Tạo Bài Tập Mới',
    editAssignment: 'Chỉnh Sửa Bài Tập',

    metadata: {
      title: 'Thông Tin Bài Tập',
      fields: {
        title: 'Tiêu Đề',
        titlePlaceholder: 'Nhập tiêu đề bài tập...',
        class: 'Lớp',
        classPlaceholder: 'Chọn lớp học',
        description: 'Mô Tả',
        descriptionPlaceholder: 'Thêm hướng dẫn hoặc nội dung cho bài tập...',
        dueDate: 'Hạn Nộp',
        dueDatePlaceholder: 'Chọn hạn nộp',
      },
    },

    questions: {
      title: 'Câu Hỏi',
      addFromBank: 'Thêm Từ Kho Câu Hỏi',
      emptyState: {
        title: 'Chưa có câu hỏi',
        description: 'Thêm câu hỏi từ kho để bắt đầu',
      },
      stats: '{{count}} câu hỏi • {{points}} điểm',
      stats_plural: '{{count}} câu hỏi • {{points}} điểm',
    },

    actions: {
      saveDraft: 'Lưu Nháp',
      publish: 'Xuất Bản',
      cancel: 'Hủy',
      delete: 'Xóa Bài Tập',
    },

    validation: {
      titleRequired: 'Tiêu đề bài tập là bắt buộc',
      classRequired: 'Vui lòng chọn lớp học',
      noQuestions: 'Bài tập phải có ít nhất một câu hỏi',
      dueDateRequired: 'Hạn nộp là bắt buộc khi xuất bản',
      dueDatePast: 'Hạn nộp phải trong tương lai',
    },

    toast: {
      draftSaved: 'Đã lưu bản nháp',
      published: 'Đã xuất bản bài tập',
      deleted: 'Đã xóa bài tập',
      error: 'Không thể lưu bài tập',
    },
  },

  teacherQuestionBank: {
    title: 'Ngân hàng câu hỏi của tôi',
    subtitle: 'Quản lý thư viện câu hỏi cá nhân',

    actions: {
      create: 'Tạo câu hỏi',
      import: 'Nhập CSV',
      export: 'Xuất CSV',
      deleteSelected: 'Xóa đã chọn',
      copyToPersonal: 'Sao chép vào kho cá nhân',
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
