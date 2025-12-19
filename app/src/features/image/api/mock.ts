import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type ImageApiService,
  type ImageGenerationRequest,
  type ImageGenerationResponse,
  type ImageData,
  type GetImagesParams,
  type ArtStyleApiResponse,
  type GetArtStylesParams,
} from '../types/service';

/**
 * Generate mock image data
 */
const generateMockImages = (): ImageData[] => {
  const prompts = [
    'A beautiful sunset over the mountains',
    'A cyberpunk cityscape at night',
    'A peaceful forest with morning mist',
    'Modern minimalist architecture',
    'Colorful abstract geometric patterns',
    'Vintage car in urban setting',
    'Tropical beach at golden hour',
    'Snow-covered mountain peaks',
    'Futuristic space station',
    'Cozy coffee shop interior',
    'Wild ocean waves crashing',
    'Desert landscape at dusk',
    'Cherry blossom in spring',
    'Urban street photography',
    'Mystical fantasy castle',
    'Underwater coral reef scene',
    'Autumn forest pathway',
    'Modern tech workspace',
    'Ancient temple ruins',
    'Northern lights aurora',
    'Rustic countryside barn',
    'Neon-lit city streets',
    'Minimalist zen garden',
    'Gothic cathedral interior',
    'Vibrant street market',
    'Misty mountain lake',
    'Industrial warehouse aesthetic',
    'Elegant art deco design',
    'Tropical rainforest canopy',
    'Serene meditation space',
    'Dynamic sports action',
    'Whimsical children illustration',
    'Sophisticated wine cellar',
    'Dramatic storm clouds',
    'Cozy winter cabin',
    'Bustling train station',
    'Tranquil japanese garden',
    'Modern glass skyscraper',
    'Enchanted forest scene',
    'Vintage bookshop interior',
    'Cosmic nebula space',
    'Mediterranean coastal town',
    'Contemporary art gallery',
    'Rustic farmhouse kitchen',
    'Luxury yacht at sunset',
    'Historic library interior',
    'Colorful carnival lights',
    'Minimalist desert scene',
    'Victorian garden party',
    'Futuristic drone shot',
  ];

  const styles = ['realistic', 'digital-art', 'artistic', 'abstract', 'vintage', 'modern'];
  const qualities = ['high', 'medium', 'standard'];

  // Different aspect ratios for masonry effect
  const dimensions = [
    { width: 800, height: 600 }, // 4:3
    { width: 800, height: 1000 }, // 4:5 (portrait)
    { width: 800, height: 450 }, // 16:9 (landscape)
    { width: 800, height: 800 }, // 1:1 (square)
    { width: 800, height: 1200 }, // 2:3 (tall)
    { width: 800, height: 533 }, // 3:2
    { width: 800, height: 500 }, // 8:5
    { width: 800, height: 900 }, // Slightly tall
  ];

  return prompts.map((prompt, index) => {
    const dimension = dimensions[index % dimensions.length];
    return {
      id: `img-${index + 1}`,
      url: `https://picsum.photos/seed/${index + 1}/${dimension.width}/${dimension.height}`,
      prompt,
      style: styles[index % styles.length],
      size: `${dimension.width}x${dimension.height}`,
      quality: qualities[index % qualities.length],
      createdAt: new Date(Date.now() - index * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - index * 3600000).toISOString(),
    };
  });
};

/**
 * Mock image data for testing
 */
const mockImages: ImageData[] = generateMockImages();

let mockImageStore: ImageData[] = [...mockImages];

export default class ImageMockService implements ImageApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newImage: ImageData = {
          id: crypto.randomUUID(),
          url: `https://picsum.photos/800/600?random=${Date.now()}`,
          prompt: request.prompt,
          style: request.style || 'realistic',
          size: request.size || '800x600',
          quality: request.quality || 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to mock store
        mockImageStore = [newImage, ...mockImageStore];

        const response: ImageGenerationResponse = {
          images: [newImage],
        };

        resolve(response);
      }, 2000); // Simulate API delay for image generation
    });
  }

  async getImageById(id: string): Promise<ImageData | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const image = mockImageStore.find((img) => img.id === id) || null;
        resolve(image);
      }, 500);
    });
  }

  async getImages(params?: GetImagesParams): Promise<ImageData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const search = params?.search?.toLowerCase() || '';

        // Filter by search term
        let filteredImages = mockImageStore;
        if (search) {
          filteredImages = mockImageStore.filter(
            (img) => img.prompt?.toLowerCase().includes(search) || img.style?.toLowerCase().includes(search)
          );
        }

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedImages = filteredImages.slice(startIndex, endIndex);

        resolve(paginatedImages);
      }, 500);
    });
  }

  async generatePresentationImage(
    _id: string,
    _slideId: string,
    _elementId: string,
    _request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a mock image URL
        const response: ImageGenerationResponse = {
          images: [
            {
              id: crypto.randomUUID(),
              url: `https://picsum.photos/800/600?random=${Date.now()}`,
            },
          ],
        };
        resolve(response);
      }, 10000);
    });
  }

  async getArtStyles(_params?: GetArtStylesParams): Promise<ArtStyleApiResponse[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockArtStyles: ArtStyleApiResponse[] = [
          {
            id: '',
            name: 'None',
            labelKey: 'none',
            visual: 'https://placehold.co/600x400/FFFFFF/31343C?text=None',
            modifiers: null,
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'photorealistic',
            name: 'Photorealistic',
            labelKey: 'photorealistic',
            visual: 'https://placehold.co/600x400/667eea/ffffff?text=Photorealistic',
            modifiers: 'photorealistic, highly detailed, realistic photography',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'digital-art',
            name: 'Digital Art',
            labelKey: 'digitalArt',
            visual: 'https://placehold.co/600x400/f093fb/ffffff?text=Digital+Art',
            modifiers: 'digital art, digital painting, concept art',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'oil-painting',
            name: 'Oil Painting',
            labelKey: 'oilPainting',
            visual: 'https://placehold.co/600x400/4facfe/ffffff?text=Oil+Painting',
            modifiers: 'oil painting, traditional art, painterly style',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'watercolor',
            name: 'Watercolor',
            labelKey: 'watercolor',
            visual: 'https://placehold.co/600x400/00f2fe/ffffff?text=Watercolor',
            modifiers: 'watercolor, aquarelle, soft washes',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'anime',
            name: 'Anime',
            labelKey: 'anime',
            visual: 'https://placehold.co/600x400/43e97b/ffffff?text=Anime',
            modifiers: 'anime style, manga, japanese animation',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'cartoon',
            name: 'Cartoon',
            labelKey: 'cartoon',
            visual: 'https://placehold.co/600x400/fa709a/ffffff?text=Cartoon',
            modifiers: 'cartoon style, cel shaded, vibrant colors',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'sketch',
            name: 'Sketch',
            labelKey: 'sketch',
            visual: 'https://placehold.co/600x400/fee140/ffffff?text=Sketch',
            modifiers: 'pencil sketch, hand drawn, line art',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'abstract',
            name: 'Abstract',
            labelKey: 'abstract',
            visual: 'https://placehold.co/600x400/30cfd0/ffffff?text=Abstract',
            modifiers: 'abstract art, non-representational, geometric',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
          {
            id: 'surreal',
            name: 'Surreal',
            labelKey: 'surreal',
            visual: 'https://placehold.co/600x400/ffecd2/ffffff?text=Surreal',
            modifiers: 'surrealism, dreamlike, fantastical',
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: null,
          },
        ];

        // Filter only enabled styles
        resolve(mockArtStyles.filter((s) => s.isEnabled));
      }, 500);
    });
  }
}
