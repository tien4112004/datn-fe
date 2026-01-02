export default {
  title: 'Quản lý Ma trận đề thi',
  subtitle: 'Tạo và quản lý đặc tả đề thi (Bảng hai chiều)',

  columns: {
    name: 'Tên',
    subject: 'Môn học',
    targetPoints: 'Điểm mục tiêu',
    topicCount: 'Chủ đề',
    cellCount: 'Ô',
    createdAt: 'Ngày tạo',
  },

  toolbar: {
    createNew: 'Tạo ma trận mới',
    delete: 'Xóa',
    duplicate: 'Sao chép',
    generateExam: 'Tạo đề thi',
    export: 'Xuất',
    import: 'Nhập',
  },

  filters: {
    title: 'Bộ lọc',
    searchPlaceholder: 'Tìm kiếm ma trận...',
    subject: 'Môn học',
    allSubjects: 'Tất cả môn',
    clearFilters: 'Xóa bộ lọc',
  },

  builder: {
    title: 'Trình tạo ma trận',
    createTitle: 'Tạo ma trận đề thi',
    editTitle: 'Chỉnh sửa ma trận đề thi',
    tabs: {
      configuration: 'Cấu hình',
      preview: 'Xem trước',
    },

    config: {
      basicInfo: 'Thông tin cơ bản',
      name: 'Tên ma trận',
      namePlaceholder: 'vd: Kiểm tra giữa kỳ - Toán lớp 10',
      description: 'Mô tả',
      descriptionPlaceholder: 'Mô tả tùy chọn...',
      subject: 'Môn học',
      targetPoints: 'Tổng điểm mục tiêu',
      targetPointsDescription: 'Tổng điểm mong muốn cho bài thi này',
    },

    topics: {
      title: 'Chủ đề',
      subtitle: 'Xác định các chủ đề trong bài thi',
      addTopic: 'Thêm chủ đề',
      manageTopic: 'Quản lý chủ đề',
      noTopics: 'Chưa có chủ đề nào',
      addFirstTopic: 'Thêm chủ đề để xác định cấu trúc ma trận',
    },

    grid: {
      title: 'Lưới ma trận',
      subtitle: 'Xác định yêu cầu câu hỏi cho từng tổ hợp chủ đề × độ khó',
      topic: 'Chủ đề',
      difficulty: 'Độ khó',
      clickToEdit: 'Nhấp vào ô để chỉnh sửa yêu cầu',
      empty: 'Trống',
      questions: '{{count}} câu hỏi',
      questions_plural: '{{count}} câu hỏi',
      points: '{{points}} điểm',
    },

    cell: {
      editTitle: 'Chỉnh sửa yêu cầu ô',
      topic: 'Chủ đề',
      difficulty: 'Độ khó',
      questionCount: 'Số câu hỏi',
      questionCountPlaceholder: 'vd: 5',
      pointsPerQuestion: 'Điểm mỗi câu',
      pointsPerQuestionPlaceholder: 'vd: 2',
      totalPoints: 'Tổng điểm ô',
      clear: 'Xóa ô',
      save: 'Lưu',
      cancel: 'Hủy',
    },

    preview: {
      title: 'Xem trước ma trận',
      summary: 'Tóm tắt',
      totalTopics: 'Tổng số chủ đề',
      totalCells: 'Tổng số ô',
      totalQuestions: 'Tổng số câu hỏi',
      totalPoints: 'Tổng điểm',
      targetPoints: 'Điểm mục tiêu',
      difference: 'Chênh lệch',
    },

    actions: {
      save: 'Lưu ma trận',
      cancel: 'Hủy',
      saveAndClose: 'Lưu & Đóng',
    },
  },

  topic: {
    dialogTitle: 'Quản lý chủ đề',
    dialogSubtitle: 'Thêm chủ đề để xác định cấu trúc ma trận đề thi',
    createTitle: 'Tạo chủ đề mới',
    editTitle: 'Chỉnh sửa chủ đề',
    name: 'Tên chủ đề',
    namePlaceholder: 'Nhập tên chủ đề (vd: Đại số, Ngữ pháp)',
    description: 'Mô tả',
    descriptionPlaceholder: 'Nhập mô tả chủ đề',
    subject: 'Môn học',
    save: 'Lưu chủ đề',
    cancel: 'Hủy',
    delete: 'Xóa chủ đề',
    addButton: 'Thêm chủ đề',
    addToMatrix: 'Thêm',
    done: 'Xong',

    sections: {
      addNew: 'Thêm chủ đề mới',
      current: 'Chủ đề hiện tại',
      currentCount: 'Chủ đề hiện tại ({{count}})',
      previous: 'Chủ đề đã tạo trước đây',
      previousCount: 'Chủ đề đã tạo trước đây ({{count}})',
      previousSubtitle: 'Các chủ đề bạn đã sử dụng trong các ma trận khác. Nhấp để sử dụng lại.',
    },

    validation: {
      nameRequired: 'Tên chủ đề là bắt buộc',
      descriptionRequired: 'Mô tả chủ đề là bắt buộc',
      alreadyInMatrix: 'Chủ đề này đã có trong ma trận của bạn',
      alreadyAdded: 'Chủ đề đã được thêm vào ma trận này',
    },

    emptyState: {
      noTopics: 'Chưa có chủ đề nào. Tạo chủ đề đầu tiên ở trên.',
    },

    deleteConfirm: {
      title: 'Xóa chủ đề',
      description:
        'Bạn có chắc chắn muốn xóa chủ đề này? Chủ đề đang được sử dụng trong ma trận không thể xóa.',
      cancel: 'Hủy',
      confirm: 'Xóa',
    },
  },

  generator: {
    title: 'Tạo đề thi từ ma trận',
    subtitle: 'Chọn câu hỏi phù hợp với yêu cầu ma trận để tạo đề thi',
    cellStatus: 'Yêu cầu ô',
    questionBank: 'Ngân hàng câu hỏi',
    generateButton: 'Tạo đề thi',
    cancelButton: 'Hủy',
    success: 'Đề thi đã được tạo thành công',
    selectCell: 'Chọn một ô để lọc câu hỏi',
    noActiveCell: 'Chọn một ô bên trái để xem câu hỏi phù hợp',
    alreadyAssigned: 'Câu hỏi đã được gán cho {{topic}} - {{difficulty}}',
  },

  cellStatus: {
    fulfilled: 'Đã đủ',
    partial: 'Một phần',
    empty: 'Trống',
    questionsSelected: '{{selected}}/{{required}} câu hỏi',
    pointsSelected: '{{selected}}/{{required}} điểm',
    clickToFilter: 'Nhấp để lọc câu hỏi cho ô này',
  },

  progress: {
    title: 'Tiến độ ma trận',
    overall: 'Tiến độ tổng thể',
    cellsCompleted: '{{completed}}/{{total}} ô đã hoàn thành',
    pointsProgress: '{{current}}/{{target}} điểm đã gán',
    status: {
      valid: 'Ma trận hoàn chỉnh và hợp lệ',
      invalid: 'Ma trận có lỗi',
      partial: 'Ma trận chưa hoàn chỉnh',
    },
    errors: 'Lỗi ({{count}})',
    warnings: 'Cảnh báo ({{count}})',
    noErrors: 'Không có lỗi',
    noWarnings: 'Không có cảnh báo',
  },

  validation: {
    nameRequired: 'Tên ma trận là bắt buộc',
    subjectRequired: 'Môn học là bắt buộc',
    targetPointsRequired: 'Điểm mục tiêu là bắt buộc',
    targetPointsPositive: 'Điểm mục tiêu phải là số dương',
    noTopics: 'Cần ít nhất một chủ đề',
    noCells: 'Cần ít nhất một ô',
    cellQuestionCountPositive: 'Số câu hỏi phải là số dương',
    cellPointsPositive: 'Điểm mỗi câu phải là số dương',
  },

  messages: {
    created: 'Tạo ma trận thành công',
    updated: 'Cập nhật ma trận thành công',
    deleted: 'Xóa ma trận thành công',
    duplicated: 'Sao chép ma trận thành công',
    exported: 'Xuất ma trận thành công',
    imported: '{{success}} ma trận được nhập thành công, {{failed}} thất bại',
    topicCreated: 'Tạo chủ đề thành công',
    topicUpdated: 'Cập nhật chủ đề thành công',
    topicDeleted: 'Xóa chủ đề thành công',
    topicInUse: 'Không thể xóa chủ đề đang được sử dụng trong ma trận',
    validated: 'Kiểm tra ma trận hoàn tất',
    error: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  },

  emptyState: 'Không tìm thấy ma trận đề thi nào. Tạo ma trận đầu tiên để bắt đầu.',

  deleteDialog: {
    title: 'Xóa ma trận',
    description: 'Bạn có chắc chắn muốn xóa {{count}} ma trận? Hành động này không thể hoàn tác.',
    cancel: 'Hủy',
    confirm: 'Xóa',
  },

  subjects: {
    T: 'Toán',
    TV: 'Tiếng Việt',
    TA: 'Tiếng Anh',
  },

  difficulty: {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
    nhan_biet: 'Nhận biết',
    thong_hieu: 'Thông hiểu',
    van_dung: 'Vận dụng',
    van_dung_cao: 'Vận dụng cao',
  },

  table: {
    total: 'Tổng',
    edit: 'Sửa',
    duplicate: 'Sao chép',
    delete: 'Xóa',
  },

  status: {
    fulfilled: 'Đã đủ',
    partial: 'Một phần',
    empty: 'Trống',
    perfectMatch: 'Khớp hoàn hảo!',
    withinTolerance: 'Trong phạm vi cho phép',
    offBy: 'Chênh lệch',
  },

  labels: {
    filteringFor: 'Đang lọc cho:',
    questions: 'Câu hỏi',
    points: 'Điểm',
    totalCells: 'Tổng số ô',
    totalQuestions: 'Tổng số câu hỏi',
    totalPoints: 'Tổng điểm',
    pointsProgress: 'Tiến độ điểm',
    ptsFromTarget: 'điểm so với mục tiêu',
  },

  loading: {
    saving: 'Đang lưu...',
    loading: 'Đang tải...',
    loadingQuestions: 'Đang tải câu hỏi...',
  },

  emptyStates: {
    noQuestions: 'Không tìm thấy câu hỏi',
    matrixNotFound: 'Không tìm thấy ma trận',
    addTopicsFirst: 'Thêm chủ đề trước để xác định lưới ma trận',
    createFirstMatrix: 'Tạo ma trận đề thi đầu tiên để bắt đầu',
  },

  buttons: {
    backToList: 'Quay lại danh sách ma trận',
    done: 'Xong',
  },

  breadcrumbs: {
    examMatrix: 'Ma trận đề thi',
    editMatrix: 'Sửa ma trận',
    createMatrix: 'Tạo ma trận',
  },

  toasts: {
    unassigned: 'Đã hủy gán khỏi {{name}}',
    cellFull: 'Ô đã đủ (cần {{count}} câu hỏi)',
    assigned: 'Đã gán cho {{name}}',
    cellsNotFulfilled: '{{count}} ô chưa được đáp ứng đầy đủ',
    selectOneMatrix: 'Vui lòng chọn chính xác một ma trận',
    matrixNotFound: 'Không tìm thấy ma trận',
    examGenerated: 'Đề thi đã được tạo: {{name}}',
  },

  confirmations: {
    deleteMatrix: 'Bạn có chắc chắn muốn xóa ma trận này?',
  },

  search: {
    placeholder: 'Tìm kiếm câu hỏi...',
  },

  fallbacks: {
    untitledQuestion: 'Câu hỏi không có tiêu đề',
  },
};
