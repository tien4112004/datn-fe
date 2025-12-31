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
};
