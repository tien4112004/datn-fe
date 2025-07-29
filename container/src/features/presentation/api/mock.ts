import { API_MODE, type ApiMode } from '@/shared/constants';
import { type PresentationItem, type PresentationApiService } from '../types';

const mockPresentationItems: PresentationItem[] = [
  {
    id: '1',
    title: 'Mock Presentation Item 1',
    description: 'This is the first Mock Presentation Item for testing purposes',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: 'Mock Presentation Item 2',
    description: 'This is the second Mock Presentation Item for testing purposes',
    createdAt: '2024-01-16T14:20:00Z',
    status: 'inactive',
  },
  {
    id: '3',
    title: 'Mock Presentation Item 3',
    description: 'This is the third Mock Presentation Item for testing purposes',
    createdAt: '2024-01-17T09:45:00Z',
    status: 'active',
  },
];

export default class PresentationMockService implements PresentationApiService {
  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getPresentationItems(): Promise<PresentationItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPresentationItems]), 500);
    });
  }
}
