import type { AssessmentMatrixApiService } from '@/features/assessment-matrix/types/service';

/**
 * Get the Assessment Matrix API service
 * NOTE: This feature currently has no backend implementation.
 * A real service needs to be created when the backend API is available.
 */
export const useAssessmentMatrixApiService = (): AssessmentMatrixApiService => {
  // TODO: Create AssessmentMatrixService with DI pattern when backend is ready
  // return new AssessmentMatrixService(api, getBackendUrl());
  throw new Error('Assessment Matrix API service not implemented yet. Backend API required.');
};
