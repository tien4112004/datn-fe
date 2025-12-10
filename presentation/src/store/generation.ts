import { defineStore } from 'pinia';
import { getPresentationApi, type PresentationGenerationRequest } from '../services/presentationApi';

export interface AiResultSlide {
  result: Record<string, any>;
  order: number;
  theme?: any;
}

interface GenerationState {
  isStreaming: boolean;
  streamedData: AiResultSlide[];
  error: string | null;
  presentationId: string | null;
  request: PresentationGenerationRequest | null;
  abortController: AbortController | null;
}

export const useGenerationStore = defineStore('generation', {
  state: (): GenerationState => ({
    isStreaming: false,
    streamedData: [],
    error: null,
    presentationId: null,
    request: null,
    abortController: null,
  }),

  getters: {
    hasError(): boolean {
      return !!this.error;
    },
    presentationIdOrThrow(): string {
      if (!this.presentationId) {
        throw new Error('Presentation ID not available');
      }
      return this.presentationId;
    },
  },

  actions: {
    /**
     * Start streaming a new presentation generation
     */
    async startStreaming(request: PresentationGenerationRequest) {
      this.isStreaming = true;
      this.streamedData = [];
      this.error = null;
      this.request = request;
      this.abortController = new AbortController();
      const presentationApi = getPresentationApi();

      try {
        const response = await presentationApi.streamPresentation(request, this.abortController.signal);

        this.presentationId = response.presentationId;

        if (response.error) {
          this.error = String(response.error);
          return;
        }

        // Process stream - each chunk is a complete JSON object
        let slideIndex = 0;
        for await (const chunk of response.stream) {
          console.log('Received chunk:', chunk);

          try {
            const slideData = JSON.parse(chunk);
            this.addStreamedSlide(slideData, slideIndex);
            console.log('Added streamed slide:', slideData);
            slideIndex++;
          } catch (error) {
            console.error('Failed to parse chunk:', chunk, error);
            // Continue processing other chunks even if one fails
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          this.error = 'Streaming cancelled';
        } else {
          this.error = error instanceof Error ? error.message : 'Unknown error occurred';
        }
      } finally {
        this.isStreaming = false;
      }
    },

    /**
     * Add a single streamed slide to the collection
     */
    addStreamedSlide(slideData: Record<string, any>, order: number) {
      this.streamedData.push({
        result: slideData,
        order,
        theme: this.request?.presentation.theme,
      });
    },

    /**
     * Stop streaming (abort current stream)
     */
    stopStreaming() {
      if (this.abortController) {
        this.abortController.abort();
      }
      this.isStreaming = false;
    },

    /**
     * Clear all streamed data
     */
    clearStreamedData() {
      this.streamedData = [];
      this.presentationId = null;
      this.error = null;
      this.request = null;
    },

    /**
     * Set the generation request
     */
    setRequest(request: PresentationGenerationRequest) {
      this.request = request;
    },

    /**
     * Set error message
     */
    setError(error: string | null) {
      this.error = error;
    },
  },
});
