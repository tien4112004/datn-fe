export default {
  emptyState: {
    noSlides: {
      title: 'Chưa có slide nào',
      description: 'Bắt đầu bằng cách thêm slide đầu tiên',
      addSlide: 'Thêm Slide',
    },
    cannotPresent: 'Không thể bắt đầu trình chiếu khi không có slide',
  },
  error: {
    processingFailed: 'Không thể tải bài trình bày',
    retry: 'Thử lại',
    aiResultNotFound: 'Bài trình bày này chưa được tạo',
    serverError: 'Máy chủ gặp lỗi khi xử lý',
    timeout: 'Xử lý mất quá nhiều thời gian',
  },
  loading: {
    generatingPresentation: 'Đang tải bài trình bày...',
    processingSlides: 'Đang xử lý slide...',
  },
};
