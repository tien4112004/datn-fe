import { API_MODE, type ApiMode } from '@/shared/constants';
import { type DemoApiService, type DemoItem } from '../types';
// import api from '@/shared/api';

const mockDemoItems: DemoItem[] = [
  {
    id: '1',
    title: 'API Demo Item 1',
    description: 'This is the first API Demo Item for testing purposes',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: 'API Demo Item 2',
    description: 'This is the second API Demo Item for testing purposes',
    createdAt: '2024-01-16T14:20:00Z',
    status: 'inactive',
  },
  {
    id: '3',
    title: 'API Demo Item 3',
    description: 'This is the third API Demo Item for testing purposes',
    createdAt: '2024-01-17T09:45:00Z',
    status: 'active',
  },
];

export default class DemoRealApiService implements DemoApiService {
  //   async getDemoItems(): Promise<DemoItem[]> {
  //     const response = await api.get<DemoItem[]>('/demo/items');
  //     return response.data;
  //   }
  getType(): ApiMode {
    return API_MODE.real;
  }

  async getDemoItems(): Promise<DemoItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockDemoItems]), 500);
    });
  }
}
