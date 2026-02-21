import { api, getBackendUrl } from '@aiprimary/api';
import SubmissionService from './submission.service';

let submissionService: SubmissionService | null = null;

export const getSubmissionApiService = () => {
  if (!submissionService) {
    submissionService = new SubmissionService(api, getBackendUrl());
  }
  return submissionService;
};

export const useSubmissionApiService = () => {
  return getSubmissionApiService();
};
