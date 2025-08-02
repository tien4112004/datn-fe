import { API_MODE, type ApiMode } from '@/shared/constants';
import { type OutlineItem, type PresentationApiService } from '../types';

const mockOutlineItems: OutlineItem[] = [
  {
    id: '1',
    htmlContent: '<div><h1>Introduction to Web Development</h1><p>This slide covers the basics of web development including HTML, CSS, and JavaScript fundamentals.</p></div>',
  },
  {
    id: '2',
    htmlContent: '<div><h1>Frontend Frameworks</h1><p>Overview of popular frontend frameworks like React, Vue, and Angular with their key features and use cases.</p></div>',
  },
  {
    id: '3',
    htmlContent: '<div><h1>Backend Technologies</h1><p>Exploring server-side technologies including Node.js, Python, and database management systems.</p></div>',
  },
];

export default class PresentationMockService implements PresentationApiService {
  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getPresentationItems(): Promise<OutlineItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockOutlineItems]), 500);
    });
  }
}
