import { useQuery } from '@tanstack/react-query';
import { api, webviewApi, getApiClientMode } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export interface ChapterOption {
  id: string;
  name: string;
}

const fetchChapters = async (grade: string, subject: string): Promise<ChapterOption[]> => {
  const baseUrl = getBackendUrl();
  const clientMode = getApiClientMode();
  const client = clientMode === 'webview' ? webviewApi : api;

  const response = await client.get<{ code: number; data: ChapterOption[] }>(
    `${baseUrl}/api/chapters?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`
  );
  return response.data.data ?? [];
};

export const useChapters = (grade?: string, subject?: string) => {
  const enabled = Boolean(grade && subject);

  const { data, isLoading } = useQuery({
    queryKey: ['chapters', grade, subject],
    queryFn: () => fetchChapters(grade!, subject!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return {
    chapters: data ?? [],
    isLoading: enabled && isLoading,
  };
};
