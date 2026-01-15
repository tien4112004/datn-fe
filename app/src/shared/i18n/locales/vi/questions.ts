/**
 * Question Bank Translations (Vietnamese)
 */
export default {
  title: 'Ngân hàng câu hỏi',

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
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
    superHard: 'Rất khó',
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
      explanation: 'Giải thích (Tùy chọn)',
      explanationPlaceholder: 'Thêm giải thích cho đáp án đúng...',
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
      title: 'Tiêu đề câu hỏi (Tùy chọn)',
      titlePlaceholder: 'Nhập ngữ cảnh bổ sung nếu cần...',
      sentence: 'Câu có chỗ trống',
      blankPlaceholder: 'Chỗ trống {{number}}',
      addBlank: 'Thêm chỗ trống',
      caseSensitive: 'Phân biệt chữ hoa chữ thường',
      imageUrl: 'URL hình ảnh (Tùy chọn)',
      explanation: 'Giải thích (Tùy chọn)',
      correctAnswer: 'Đáp án đúng',
      acceptableAnswers: 'Các đáp án thay thế chấp nhận được',
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
    },
  },
};
