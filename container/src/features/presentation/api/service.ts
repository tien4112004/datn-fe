import { API_MODE, type ApiMode } from '@/shared/constants';
import { type PresentationApiService, type PresentationItem } from '../types';
// import api from '@/shared/api';

const mockPresentationItems: PresentationItem[] = [
  {
    id: '1',
    title: 'API Presentation Item 1',
    description: 'This is the first API Presentation Item for testing purposes',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: 'API Presentation Item 2',
    description: 'This is the second API Presentation Item for testing purposes',
    createdAt: '2024-01-16T14:20:00Z',
    status: 'inactive',
  },
  {
    id: '3',
    title: 'API Presentation Item 3',
    description: 'This is the third API Presentation Item for testing purposes',
    createdAt: '2024-01-17T09:45:00Z',
    status: 'active',
  },
];

export default class PresentationRealApiService implements PresentationApiService {
  //   async getPresentationItems(): Promise<PresentationItem[]> {
  //     const response = await api.get<PresentationItem[]>('/presentation/items');
  //     return response.data;
  //   }
  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPresentationItems(): Promise<PresentationItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPresentationItems]), 500);
    });
  }
}
