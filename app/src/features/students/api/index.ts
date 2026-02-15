import { api } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';
import StudentService, { type StudentApiService } from './service';

export const useStudentApiService = (): StudentApiService => {
  return new StudentService(api, getBackendUrl());
};

export type { StudentApiService };
