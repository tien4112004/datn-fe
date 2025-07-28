import { type DemoItem, type DemoApiService } from './interface';

const mockDemoItems: DemoItem[] = [
  {
    id: '1',
    title: 'Mock Demo Item 1',
    description: 'This is the first Mock Demo Item for testing purposes',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: 'Mock Demo Item 2',
    description: 'This is the second Mock Demo Item for testing purposes',
    createdAt: '2024-01-16T14:20:00Z',
    status: 'inactive',
  },
  {
    id: '3',
    title: 'Mock Demo Item 3',
    description: 'This is the third Mock Demo Item for testing purposes',
    createdAt: '2024-01-17T09:45:00Z',
    status: 'active',
  },
];

export default class DemoMockService implements DemoApiService {
  async getDemoItems(): Promise<DemoItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockDemoItems]), 500);
    });
  }
}
