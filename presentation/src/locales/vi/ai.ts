export default {
  // Tính năng AI
  ai: {
    dialog: {
      title: 'AIPPT',
      templateSubtitle: 'Chọn một mẫu phù hợp bên dưới để bắt đầu tạo bài thuyết trình',
      outlineSubtitle:
        'Xác nhận dàn ý nội dung bên dưới (nhấn để chỉnh sửa nội dung, nhấp chuột phải để thêm/xóa mục dàn ý), sau đó bắt đầu chọn mẫu',
      setupSubtitle:
        'Nhập chủ đề bài thuyết trình bên dưới và thêm thông tin phù hợp như ngành nghề, chức vụ, môn học, mục đích, v.v.',
      topicPlaceholder:
        'Vui lòng nhập chủ đề bài thuyết trình, ví dụ: Lập kế hoạch nghề nghiệp cho sinh viên đại học',
      generate: 'Tạo bằng AI',

      // Cài đặt
      settings: {
        language: 'Ngôn ngữ:',
        style: 'Phong cách:',
        model: 'Mô hình:',
        images: 'Hình ảnh:',
      },

      // Tùy chọn
      languages: {
        chinese: 'Tiếng Trung',
        english: 'Tiếng Anh',
        japanese: 'Tiếng Nhật',
      },

      styles: {
        general: 'Chung',
        academic: 'Học thuật',
        workplace: 'Công sở',
        education: 'Giáo dục',
        marketing: 'Tiếp thị',
      },

      models: {
        glm4Flash: 'GLM-4-Flash',
        glm4FlashX: 'GLM-4-FlashX',
        doubaoLite: 'doubao-1.5-lite-32k',
        doubaoSeed: 'doubao-seed-1.6-flash',
      },

      imageOptions: {
        none: 'Không có',
        mockTest: 'Kiểm tra thử',
        aiSearch: 'Tìm kiếm AI',
        aiCreate: 'Tạo bằng AI',
      },

      // Hành động
      actions: {
        selectTemplate: 'Chọn mẫu',
        backToRegenerate: 'Quay lại để tạo lại',
        backToOutline: 'Quay lại dàn ý',
      },

      // Trạng thái
      status: {
        loadingTip: 'AI đang tạo, vui lòng chờ trong giây lát...',
        enterTopicError: 'Vui lòng nhập chủ đề bài thuyết trình trước',
      },

      // Chủ đề mẫu
      sampleTopics: {
        companyAnnualMeetingPlanning: 'Lập kế hoạch họp thường niên công ty',
        howBigDataChangesTheWorld: 'Dữ liệu lớn thay đổi thế giới như thế nào',
        restaurantMarketResearch: 'Khảo sát thị trường nhà hàng',
        aigcApplicationsInEducation: 'Ứng dụng AIGC trong giáo dục',
        how5GTechnologyChangesOurLives: 'Công nghệ 5G thay đổi cuộc sống của chúng ta như thế nào',
        collegeStudentCareerPlanning: 'Lập kế hoạch nghề nghiệp cho sinh viên đại học',
        technologyFrontiers2025: 'Biên giới công nghệ năm 2025',
        socialMediaAndBrandMarketing: 'Mạng xã hội và tiếp thị thương hiệu',
        annualWorkSummaryAndOutlook: 'Tổng kết công việc năm và định hướng tương lai',
        blockchainTechnologyAndApplications: 'Công nghệ chuỗi khối và các ứng dụng',
      },
    },
  },
};
