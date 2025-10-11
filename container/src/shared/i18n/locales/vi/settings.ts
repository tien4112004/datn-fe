/**
 * Settings page translations
 */
export default {
  title: 'Cài đặt',
  subtitle: 'Quản lý các tùy chọn cá nhân của bạn.',
  tabs: {
    general: 'Chung',
    appearance: 'Giao diện',
    devtools: 'DevTools',
  },
  language: {
    title: 'Ngôn ngữ',
    subtitle: 'Chọn ngôn ngữ ưa thích của bạn',
  },
  devtools: {
    title: 'Phát triển',
    subtitle: 'Cấu hình phát triển và thử nghiệm.',
    useMockData: 'Sử dụng dữ liệu giả',
    useMockDataDescription: 'Bật dữ liệu giả cho phát triển và thử nghiệm',
    backendUrl: 'URL Backend',
    backendUrlPlaceholder: 'Nhập URL backend',
    backendUrlDescription: 'URL của máy chủ API backend',
    backendUrlSaved: 'URL Backend đã được lưu thành công',
    save: 'Lưu',
    aiModels: {
      title: 'Mô hình AI',
      subtitle: 'Quản lý các mô hình AI có sẵn và cấu hình của chúng.',
      loading: 'Đang tải các mô hình AI có sẵn...',
      loadingModels: 'Đang tải mô hình...',
      errorLoading: 'Không thể tải các mô hình AI.',
      errorMessage: 'Lỗi khi tải mô hình. Vui lòng thử lại sau.',
      emptyState: 'Không có mô hình nào.',
      columns: {
        model: 'Mô hình',
        provider: 'Nhà cung cấp',
        mediaTypes: 'Loại phương tiện',
        modelId: 'ID Mô hình',
        status: 'Trạng thái',
      },
      defaultModels: {
        title: 'Mô hình mặc định',
        subtitle: 'Đặt mô hình mặc định cho từng loại kết quả. Chỉ có các mô hình đã bật mới có thể chọn.',
        noModelsAvailable: 'Không có mô hình nào',
        selectDefaultModel: 'Chọn mô hình mặc định',
        currentModel: 'Hiện tại: {{modelName}} bởi {{provider}}',
        noEnabledModels: 'Không có mô hình nào được bật. Bật ít nhất một mô hình để đặt mặc định.',
      },
    },
    dangerZone: {
      title: 'Vùng nguy hiểm',
      subtitle: 'Các hành động không thể hoàn tác và phá hủy.',
      deleteEverything: 'Xóa tất cả',
      deleteEverythingMessage: 'BÙM! Mọi thứ đã bị xóa! Và đó là lỗi của bạn.',
    },
  },
};
