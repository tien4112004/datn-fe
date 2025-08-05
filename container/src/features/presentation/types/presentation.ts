export interface PresentationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'active' | 'archived';
}
