import type { AssessmentMatrixApiService } from '@/features/assessment-matrix/types/service';
import type {
  AssessmentMatrix,
  Topic,
  SubjectCode,
  CreateAssessmentMatrixRequest,
  UpdateAssessmentMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/assessment-matrix/types';

/**
 * Stub implementation of Assessment Matrix API Service
 * NOTE: This feature currently has no backend implementation.
 * A real service needs to be created when the backend API is available.
 */
const createStubService = (): AssessmentMatrixApiService => {
  return {
    getMatrixById: async (id: string): Promise<AssessmentMatrix> => {
      console.warn('[Assessment Matrix API] getMatrixById not implemented - returning empty matrix');
      return {
        id,
        name: '',
        description: '',
        subjectCode: 'T' as SubjectCode,
        targetTotalPoints: 100,
        topics: [],
        cells: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    createMatrix: async (data: CreateAssessmentMatrixRequest): Promise<AssessmentMatrix> => {
      console.warn('[Assessment Matrix API] createMatrix not implemented - returning local data');
      return {
        ...data.matrix,
        id: `matrix_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    updateMatrix: async (id: string, data: UpdateAssessmentMatrixRequest): Promise<AssessmentMatrix> => {
      console.warn('[Assessment Matrix API] updateMatrix not implemented - returning updated data');
      return {
        id,
        name: data.matrix?.name || '',
        description: data.matrix?.description || '',
        subjectCode: (data.matrix?.subjectCode || 'T') as SubjectCode,
        targetTotalPoints: data.matrix?.targetTotalPoints || 100,
        topics: data.matrix?.topics || [],
        cells: data.matrix?.cells || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    getTopicsBySubject: async (subjectCode: SubjectCode): Promise<Topic[]> => {
      console.warn('[Assessment Matrix API] getTopicsBySubject not implemented - returning empty array');
      return [];
    },

    createTopic: async (data: CreateTopicRequest): Promise<Topic> => {
      console.warn('[Assessment Matrix API] createTopic not implemented - returning local data');
      return {
        ...data.topic,
        id: `topic_${Date.now()}`,
      };
    },

    updateTopic: async (id: string, data: UpdateTopicRequest): Promise<Topic> => {
      console.warn('[Assessment Matrix API] updateTopic not implemented - returning updated data');
      return {
        id,
        name: data.topic?.name || '',
        subjectCode: (data.topic?.subjectCode || 'T') as SubjectCode,
      };
    },

    deleteTopic: async (id: string): Promise<void> => {
      console.warn('[Assessment Matrix API] deleteTopic not implemented');
    },
  };
};

/**
 * Get the Assessment Matrix API service
 * NOTE: This feature currently uses a stub implementation.
 * A real service needs to be created when the backend API is available.
 */
export const useAssessmentMatrixApiService = (): AssessmentMatrixApiService => {
  // TODO: Create AssessmentMatrixService with DI pattern when backend is ready
  // return new AssessmentMatrixService(api, getBackendUrl());
  return createStubService();
};
