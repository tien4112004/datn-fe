/**
 * Question Bank Translations (Vietnamese)
 */
export default {
  title: 'Ngân hàng câu hỏi',

  // Question Form Dialog
  form: {
    createTitle: 'Tạo câu hỏi mới',
    editTitle: 'Chỉnh sửa câu hỏi',
    metadataSection: 'Thông tin câu hỏi',
    contentSection: 'Nội dung câu hỏi',
    questionType: 'Loại câu hỏi',
    subject: 'Môn học',
    difficulty: 'Độ khó',
    validationErrors: 'Lỗi xác thực',
    cancel: 'Hủy',
    create: 'Tạo câu hỏi',
    save: 'Lưu thay đổi',

    // Toast messages
    createSuccess: 'Tạo câu hỏi thành công',
    updateSuccess: 'Cập nhật câu hỏi thành công',
    createError: 'Tạo câu hỏi thất bại',
    updateError: 'Cập nhật câu hỏi thất bại',
    missingData: 'Thiếu dữ liệu câu hỏi',
    fixErrors: 'Vui lòng sửa lỗi xác thực trước khi lưu',
  },

  // Question Bank Editor Page
  editor: {
    breadcrumb: 'Ngân hàng câu hỏi',
    createTitle: 'Tạo câu hỏi mới',
    editTitle: 'Chỉnh sửa câu hỏi',
    cancel: 'Hủy',
    save: 'Lưu thay đổi',
    saving: 'Đang lưu...',
    loading: 'Đang tải câu hỏi...',
    preview: 'Xem trước',
    edit: 'Chỉnh sửa',
    metadataSection: 'Thông tin câu hỏi',
    contentSection: 'Nội dung câu hỏi',
    questionType: 'Loại câu hỏi',
    subject: 'Môn học',
    difficulty: 'Độ khó',
    validationErrors: 'Lỗi xác thực',

    // Toast messages
    createSuccess: 'Tạo câu hỏi thành công',
    updateSuccess: 'Cập nhật câu hỏi thành công',
    createError: 'Tạo câu hỏi thất bại',
    updateError: 'Cập nhật câu hỏi thất bại',
    missingData: 'Thiếu dữ liệu câu hỏi',
    fixErrors: 'Vui lòng sửa lỗi xác thực trước khi lưu',
  },

  types: {
    multipleChoice: 'Trắc nghiệm',
    matching: 'Nối',
    openEnded: 'Tự luận',
    fillInBlank: 'Điền vào chỗ trống',
    group: 'Nhóm câu hỏi',
  },

  typeLabels: {
    multipleChoice: 'Câu hỏi trắc nghiệm',
    matching: 'Câu hỏi nối',
    openEnded: 'Câu hỏi tự luận',
    fillInBlank: 'Câu hỏi điền vào chỗ trống',
    group: 'Nhóm câu hỏi',
  },

  difficulty: {
    knowledge: 'Nhận biết',
    comprehension: 'Thông hiểu',
    application: 'Vận dụng',
    advancedApplication: 'Vận dụng cao',
  },

  bankType: {
    personal: 'Cá nhân',
    public: 'Công khai',
  },

  common: {
    points: 'Điểm',
    totalPoints: 'Tổng điểm',
    score: 'Điểm số',
    explanation: 'Giải thích',
    yourAnswer: 'Câu trả lời của bạn',
    correctAnswer: 'Đáp án đúng',
    expectedAnswer: 'Đáp án mong đợi',
    submitted: 'Đã nộp',
    noAnswer: 'Chưa có câu trả lời',
    characterRemaining: 'Còn lại {{count}} ký tự',
    characterRemaining_plural: 'Còn lại {{count}} ký tự',
    correct: 'Đúng!',
    incorrect: 'Sai',
    scoreDisplay: 'Điểm: {{score}}/{{total}} điểm',
    pointsAbbreviation: 'điểm',
    pointsAbbreviation_plural: 'điểm',
    markdownPlaceholder: 'Nhập văn bản ở đây... (Hỗ trợ Markdown)',
  },

  validation: {
    titleRequired: 'Tiêu đề là bắt buộc',
    optionTextRequired: 'Văn bản tùy chọn là bắt buộc',
    minOptions: 'Cần ít nhất 2 tùy chọn',
    maxOptions: 'Tối đa 6 tùy chọn',
    exactlyOneCorrect: 'Phải có đúng một tùy chọn được đánh dấu là đúng',
    leftItemRequired: 'Mục bên trái là bắt buộc',
    rightItemRequired: 'Mục bên phải là bắt buộc',
    minPairs: 'Cần ít nhất 2 cặp',
    maxPairs: 'Tối đa 8 cặp',
    maxLengthExceeded: 'Vượt quá độ dài tối đa',
    minSegments: 'Cần ít nhất một phân đoạn',
    subQuestionTitleRequired: 'Tiêu đề câu hỏi con là bắt buộc',
    minSubQuestions: 'Cần ít nhất một câu hỏi con',
  },

  // Multiple Choice
  multipleChoice: {
    editing: {
      title: 'Tiêu đề câu hỏi',
      titlePlaceholder: 'Nhập câu hỏi...',
      options: 'Các lựa chọn',
      optionPlaceholder: 'Lựa chọn {{letter}}',
      addOption: 'Thêm lựa chọn',
      removeOption: 'Xóa',
      correctAnswer: 'Đánh dấu là đáp án đúng',
      shuffleOptions: 'Xáo trộn lựa chọn',
      imageUrl: 'URL hình ảnh (Tùy chọn)',
      questionImage: 'Hình ảnh câu hỏi',
      optionImage: 'Hình ảnh lựa chọn',
      explanation: 'Giải thích (Tùy chọn)',
      explanationPlaceholder: 'Thêm giải thích cho đáp án đúng...',
      removeImage: 'Xóa hình ảnh',
      addImage: 'Thêm hình ảnh',
    },
    viewing: {
      options: 'Các lựa chọn:',
      shuffle: 'Xáo trộn',
      explanation: 'Giải thích:',
      points: 'Điểm: {{points}}',
    },
    doing: {
      selectAnswer: 'Chọn câu trả lời của bạn',
    },
    afterAssessment: {
      yourSelection: 'Lựa chọn của bạn',
      correctOption: 'Lựa chọn đúng',
    },
    grading: {
      autoGraded: 'Câu hỏi này được chấm điểm tự động',
      pointsEarned: 'Điểm đạt được',
      studentAnswer: 'Câu trả lời của học sinh:',
      studentAnswerTag: '(Câu trả lời của học sinh)',
      autoCalculatedScore: 'Điểm tự động tính: ',
      correctScore: 'Đúng - {{score}} điểm',
      incorrectScore: 'Sai - 0 điểm',
      grading: 'Chấm điểm',
      pointsAwarded: 'Điểm đạt được',
      maxPoints: 'Tối đa: {{points}} điểm',
      teacherFeedback: 'Nhận xét của giáo viên (Tùy chọn)',
      feedbackPlaceholder: 'Thêm nhận xét hoặc phản hồi cho học sinh...',
    },
  },

  // Matching
  matching: {
    editing: {
      title: 'Tiêu đề câu hỏi',
      titlePlaceholder: 'Nhập câu hỏi...',
      pairs: 'Các cặp nối',
      columnA: 'Cột A (Mục)',
      columnB: 'Cột B (Đích)',
      leftPlaceholder: 'Mục bên trái {{number}}',
      rightPlaceholder: 'Kết quả nối {{number}}',
      addPair: 'Thêm cặp',
      removePair: 'Xóa',
      shufflePairs: 'Xáo trộn các cặp',
      imageUrl: 'URL hình ảnh (Tùy chọn)',
      explanation: 'Giải thích (Tùy chọn)',
    },
    viewing: {
      matchingPairs: 'Các cặp nối:',
      shuffle: 'Xáo trộn',
      columnA: 'Cột A',
      columnB: 'Cột B',
      explanation: 'Giải thích:',
      points: 'Điểm: {{points}}',
    },
    doing: {
      instruction: 'Kéo các mục từ Cột A để nối với Cột B',
      columnA: 'Cột A - Các mục',
      columnB: 'Cột B - Đích',
      columnADrag: 'Cột A (Kéo từ đây)',
      columnBDrop: 'Cột B (Thả vào đây)',
      dropHere: 'Thả mục vào đây',
    },
    afterAssessment: {
      yourMatches: 'Kết quả nối của bạn',
      correctMatch: 'Kết quả nối đúng',
      noMatch: 'Không có kết quả',
      scoreSummary: 'Điểm: {{score}}/{{total}} cặp nối đúng',
    },
    grading: {
      partialCredit: 'Điểm tương ứng dựa trên số cặp nối đúng',
      correctMatches: '{{correct}} trên {{total}} đúng',
      studentAnswer: 'Câu trả lời của học sinh:',
      correctLabel: 'Đúng: ',
      correctPairs: 'Các cặp nối đúng:',
      autoCalculatedScore: 'Điểm tự động tính: ',
      correctMatchesScore: '{{correct}}/{{total}} cặp nối đúng - {{score}} điểm',
      grading: 'Chấm điểm',
      pointsAwarded: 'Điểm đạt được',
      maxPoints: 'Tối đa: {{points}} điểm',
      teacherFeedback: 'Nhận xét của giáo viên (Tùy chọn)',
      feedbackPlaceholder: 'Thêm nhận xét hoặc phản hồi cho học sinh...',
    },
  },

  // Open Ended
  openEnded: {
    editing: {
      title: 'Tiêu đề câu hỏi',
      titlePlaceholder: 'Nhập câu hỏi...',
      expectedAnswer: 'Câu trả lời mong đợi (Tùy chọn)',
      expectedAnswerPlaceholder: 'Cung cấp câu trả lời mẫu để tham khảo khi chấm điểm...',
      maxLength: 'Độ dài tối đa',
      maxLengthPlaceholder: 'Để trống nếu không giới hạn',
      characters: 'ký tự',
      imageUrl: 'URL hình ảnh (Tùy chọn)',
      explanation: 'Giải thích (Tùy chọn)',
    },
    viewing: {
      maxLength: 'Độ dài tối đa: {{maxLength}} ký tự',
      explanation: 'Giải thích:',
      points: 'Điểm: {{points}}',
    },
    doing: {
      placeholder: 'Nhập câu trả lời của bạn...',
      characterCount: '{{current}} / {{max}} ký tự',
    },
    afterAssessment: {
      manualGradingNote: 'Lưu ý: Câu hỏi tự luận yêu cầu giáo viên chấm điểm thủ công.',
      awaitingGrade: 'Đang chờ chấm điểm thủ công',
      pendingGrading: 'Chờ chấm điểm',
    },
    grading: {
      title: 'Câu hỏi tự luận - Chấm điểm',
      studentAnswer: 'Câu trả lời của học sinh:',
      noAnswer: 'Chưa có câu trả lời',
      characterCount: 'Số ký tự: {{count}}{{max}}',
      expectedAnswerReference: 'Câu trả lời mong đợi (Tham khảo):',
      gradingRequired: 'Chấm điểm (Bắt buộc cho câu hỏi tự luận)',
      pointsAwarded: 'Điểm đạt được',
      enterPoints: 'Nhập điểm...',
      maxPoints: 'Tối đa: {{points}} điểm',
      teacherFeedback: 'Nhận xét của giáo viên',
      feedbackPlaceholder: 'Cung cấp nhận xét chi tiết về câu trả lời của học sinh...',
      feedbackHint: 'Vui lòng cung cấp nhận xét mang tính xây dựng cho học sinh.',
      gradingTips: 'Gợi ý chấm điểm:',
      tip1: 'Xem xét tính đầy đủ, chính xác và rõ ràng của câu trả lời',
      tip2: 'So sánh với câu trả lời mong đợi nếu có',
      tip3: 'Cung cấp nhận xét cụ thể, có thể thực hiện',
      tip4: 'Nêu rõ cả điểm mạnh và điểm cần cải thiện',
    },
  },

  // Fill in Blank
  fillInBlank: {
    editing: {
      title: 'Tiêu đề câu hỏi',
      titlePlaceholder: 'Nhập tiêu đề câu hỏi (tùy chọn)',
      questionImage: 'Hình ảnh câu hỏi',
      questionText: 'Văn bản câu hỏi',
      questionTextPlaceholder:
        'Sử dụng {{answer}} để đánh dấu chỗ trống. Ví dụ: Tôi {{là}} một {{sinh viên}}.',
      questionTextInstruction: 'Sử dụng {{answer}} để tạo chỗ trống trong văn bản.',
      questionTextExample: 'Ví dụ: "Tôi {{là}} một {{sinh viên}}." sẽ tạo ra 2 chỗ trống.',
      preview: 'Xem trước',
      previewBlank: 'chỗ trống',
      alternativeAnswers: 'Đáp án thay thế',
      blankLabel: 'Chỗ trống {{index}}:',
      addAlternative: 'Thêm đáp án thay thế',
      alternativePlaceholder: 'Đáp án thay thế',
      explanation: 'Giải thích',
      explanationPlaceholder: 'Giải thích đáp án (tùy chọn, hiển thị sau khi đánh giá)',
      sentence: 'Câu có chỗ trống',
      blankPlaceholder: 'Chỗ trống {{number}}',
      addBlank: 'Thêm chỗ trống',
      caseSensitive: 'Phân biệt chữ hoa chữ thường',
      imageUrl: 'URL hình ảnh (Tùy chọn)',
      correctAnswer: 'Đáp án đúng',
      acceptableAnswers: 'Các đáp án thay thế chấp nhận được',
    },
    viewing: {
      expectedAnswers: 'Đáp án mong đợi:',
      blankLabel: 'Chỗ trống {{index}}',
      caseSensitiveWarning: '⚠️ Phân biệt chữ hoa chữ thường',
      explanation: 'Giải thích:',
      points: 'Điểm: {{points}}',
    },
    doing: {
      blankPlaceholder: 'Chỗ trống {{number}}',
      caseSensitiveWarning: '⚠️ Phân biệt chữ hoa chữ thường',
    },
    afterAssessment: {
      yourAnswers: 'Câu trả lời của bạn',
      correctAnswers: 'Đáp án đúng',
      empty: '(trống)',
      scoreSummary: 'Điểm: {{score}}/{{total}} chỗ trống đúng',
    },
    grading: {
      partialCredit: 'Điểm tương ứng dựa trên số chỗ trống đúng',
      correctBlanks: '{{correct}} trên {{total}} đúng',
      studentAnswer: 'Câu trả lời của học sinh:',
      blankByBlankReview: 'Xem xét từng chỗ trống:',
      blankNumber: 'Chỗ trống {{number}}',
      studentLabel: 'Học sinh: ',
      correctLabel: 'Đúng: ',
      alsoAcceptable: 'Đáp án chấp nhận được khác: ',
      caseSensitiveInfo: '⚠️ Câu hỏi này phân biệt chữ hoa chữ thường',
      autoCalculatedScore: 'Điểm tự động tính: ',
      correctBlanksScore: '{{correct}}/{{total}} chỗ trống đúng - {{score}} điểm',
      grading: 'Chấm điểm',
      pointsAwarded: 'Điểm đạt được',
      maxPoints: 'Tối đa: {{points}} điểm',
      teacherFeedback: 'Nhận xét của giáo viên (Tùy chọn)',
      feedbackPlaceholder: 'Thêm nhận xét hoặc phản hồi cho học sinh...',
    },
  },

  group: {
    title: 'Nhóm câu hỏi',
    description: 'Tạo nhóm câu hỏi chứa nhiều câu hỏi con',

    // Editing mode
    editing: {
      groupDescription: 'Mô tả nhóm',
      groupDescriptionPlaceholder: 'Nhập mô tả, đoạn văn hoặc ngữ cảnh cho nhóm câu hỏi này...',
      groupDescriptionHint: 'Cung cấp ngữ cảnh hoặc hướng dẫn cho tất cả các câu hỏi con',
      titleImage: 'Hình ảnh tiêu đề (Tùy chọn)',

      displaySettings: 'Cài đặt hiển thị',
      showNumbers: 'Hiển thị số thứ tự câu hỏi',
      shuffleQuestions: 'Xáo trộn câu hỏi',
      totalPoints: 'Tổng điểm',

      addQuestion: 'Thêm câu hỏi',
      selectType: 'Chọn loại câu hỏi:',
      subQuestions: 'Câu hỏi con',

      validationWarning: 'Nhóm câu hỏi phải chứa ít nhất một câu hỏi con.',

      types: {
        multipleChoice: 'Trắc nghiệm',
        multipleChoiceDesc: 'Một đáp án đúng',
        matching: 'Nối',
        matchingDesc: 'Nối các cặp',
        openEnded: 'Tự luận',
        openEndedDesc: 'Trả lời văn bản tự do',
        fillInBlank: 'Điền vào chỗ trống',
        fillInBlankDesc: 'Hoàn thành câu',
      },
    },

    // Viewing mode
    viewing: {
      preview: 'Xem trước',
    },

    // Doing mode
    doing: {
      progress: 'Tiến độ',
      answered: '{{count}} trên {{total}} đã trả lời',
    },

    // After Assessment mode
    afterAssessment: {
      results: 'Kết quả',
      yourScore: 'Điểm của bạn',
    },

    // Grading mode
    grading: {
      overallGrade: 'Điểm tổng thể',
      totalPointsEarned: 'Tổng điểm đạt được',
      overallFeedback: 'Nhận xét tổng thể (Tùy chọn)',
      feedbackPlaceholder: 'Thêm nhận xét cho học sinh...',
    },

    // Sub-question wrapper
    subQuestion: {
      questionNumber: 'Câu hỏi {{number}}',
      points: '{{points}} điểm',
      progress: 'Tiến độ:',
      questionsAnswered: ' câu hỏi đã trả lời',
      emptyStateTitle: 'Chưa có câu hỏi nào trong nhóm này.',
      emptyStateMessage: 'Nhấn "Thêm câu hỏi" để bắt đầu.',
    },
  },
};
