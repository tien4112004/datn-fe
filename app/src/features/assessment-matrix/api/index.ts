import type { AssessmentMatrixApiService } from '@/features/assessment-matrix/types/service';
import AssessmentMatrixMockApiService from './mock';
// import AssessmentMatrixRealApiService from './service'; // Uncomment when real API is ready

/**
 * Get the appropriate Assessment Matrix API service based on environment
 * Currently uses mock service for development
 */
export const useAssessmentMatrixApiService = (): AssessmentMatrixApiService => {
  // TODO: Switch based on environment variable or config
  // const apiMode = import.meta.env.VITE_API_MODE || 'mock';

  // For now, always use mock
  return new AssessmentMatrixMockApiService();

  // When real API is ready:
  // return apiMode === 'real' ? new AssessmentMatrixRealApiService() : new AssessmentMatrixMockApiService();
};
