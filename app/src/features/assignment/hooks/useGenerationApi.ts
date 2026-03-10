import { useMutation } from '@tanstack/react-query';
import { getGenerationService } from '../api/generation.index';
import type {
  GenerateQuestionsFromContextRequest,
  GenerateQuestionsByTopicRequest,
} from '../types/generation';

export const useGenerateQuestionsFromContext = () => {
  return useMutation({
    mutationFn: (request: GenerateQuestionsFromContextRequest) =>
      getGenerationService().generateQuestionsFromContext(request),
  });
};

export const useGenerateQuestionsByTopic = () => {
  return useMutation({
    mutationFn: (request: GenerateQuestionsByTopicRequest) =>
      getGenerationService().generateQuestionsByTopic(request),
  });
};
