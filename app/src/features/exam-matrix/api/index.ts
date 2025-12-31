import type { ExamMatrixApiService } from '@/features/exam-matrix/types/service';
import ExamMatrixMockApiService from './mock';
// import ExamMatrixRealApiService from './service'; // Uncomment when real API is ready

/**
 * Get the appropriate Exam Matrix API service based on environment
 * Currently uses mock service for development
 */
export const useExamMatrixApiService = (): ExamMatrixApiService => {
  // TODO: Switch based on environment variable or config
  // const apiMode = import.meta.env.VITE_API_MODE || 'mock';

  // For now, always use mock
  return new ExamMatrixMockApiService();

  // When real API is ready:
  // return apiMode === 'real' ? new ExamMatrixRealApiService() : new ExamMatrixMockApiService();
};
