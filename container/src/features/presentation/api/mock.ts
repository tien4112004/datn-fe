import { API_MODE, type ApiMode } from '@/shared/constants';
import { type OutlineItem, type PresentationApiService, type PresentationItem } from '../types';

const mockOutlineItems: OutlineItem[] = [
  {
    id: '1',
    htmlContent:
      '<div><h1>Introduction to Web Development</h1><p>This slide covers the basics of web development including HTML, CSS, and JavaScript fundamentals.</p></div>',
  },
  {
    id: '2',
    htmlContent:
      '<div><h1>Frontend Frameworks</h1><p>Overview of popular frontend frameworks like React, Vue, and Angular with their key features and use cases.</p></div>',
  },
  {
    id: '3',
    htmlContent:
      '<div><h1>Backend Technologies</h1><p>Exploring server-side technologies including Node.js, Python, and database management systems.</p></div>',
  },
];

const mockPresentationItems: PresentationItem[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '2',
    title: 'Frontend Frameworks Overview',
    description: 'An overview of popular frontend frameworks like React, Vue, and Angular.',
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '3',
    title: 'Backend Technologies Explained',
    description: 'Exploring server-side technologies including Node.js and Python.',
    createdAt: new Date().toISOString(),
    status: 'archived',
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

  async getOutlineItems(): Promise<OutlineItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockOutlineItems]), 500);
    });
  }
}
