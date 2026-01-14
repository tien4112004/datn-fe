import type { UploadedMediaResponse } from './api';
import type { ApiService } from '@aiprimary/api';

export class MockMediaApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'mock' as const;
  }

  /**
   * Mock implementation of image upload
   * Returns a mock CDN URL after a short delay
   */
  async uploadImage(file: File): Promise<UploadedMediaResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock CDN URL
    const mockCdnUrl = `https://mock-cdn.example.com/images/${Date.now()}-${file.name}`;

    return {
      cdnUrl: mockCdnUrl,
      mediaType: 'IMAGE',
      extension: file.name.split('.').pop() || 'jpg',
      id: Math.floor(Math.random() * 100000),
    };
  }
}
