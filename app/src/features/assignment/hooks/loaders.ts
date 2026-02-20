import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { getAssignmentApiService } from '../api';
import type { Assignment } from '@aiprimary/core';

export const getAssignmentById = async ({ params }: { params: { id?: string } }) => {
  if (!params.id) {
    throw new CriticalError('Assignment ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const apiService = getAssignmentApiService();
  const assignment = await apiService.getAssignmentById(params.id);

  // Basic sanity checks
  if (assignment && assignment.id !== params.id) {
    throw new CriticalError(
      `Assignment ID mismatch: expected ${params.id}, got ${assignment.id}`,
      ERROR_TYPE.VALIDATION
    );
  }

  return { assignment: assignment || null } as { assignment: Assignment | null };
};
