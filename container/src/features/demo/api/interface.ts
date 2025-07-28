export interface DemoItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface DemoApiService {
  getDemoItems(): Promise<DemoItem[]>;
}
