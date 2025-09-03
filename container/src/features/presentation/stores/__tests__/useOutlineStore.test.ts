import { describe, it, expect, beforeEach, vi } from 'vitest';
import useOutlineStore from '../useOutlineStore';
import type { OutlineItem } from '../../types';

// Mock the mapOutlineItemsToMarkdown utility
vi.mock('../../utils', () => ({
  mapOutlineItemsToMarkdown: vi.fn((items: OutlineItem[]) =>
    items.map((item: OutlineItem) => item.markdownContent).join('\n\n')
  ),
}));

// Mock the arrayMove utility from @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
}));

describe('useOutlineStore', () => {
  // Mock data for testing
  const mockOutlineItems: OutlineItem[] = [
    {
      id: '1',
      htmlContent: '<h1>Title 1</h1>',
      markdownContent: '# Title 1',
    },
    {
      id: '2',
      htmlContent: '<h2>Subtitle 2</h2>',
      markdownContent: '## Subtitle 2',
    },
    {
      id: '3',
      htmlContent: '<p>Content 3</p>',
      markdownContent: 'Content 3',
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    useOutlineStore.setState({
      content: [],
      contentIds: [],
      isStreaming: false,
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty content array', () => {
      const state = useOutlineStore.getState();
      expect(state.content).toEqual([]);
    });

    it('should initialize with empty contentIds array', () => {
      const state = useOutlineStore.getState();
      expect(state.contentIds).toEqual([]);
    });

    it('should initialize with isStreaming as false', () => {
      const state = useOutlineStore.getState();
      expect(state.isStreaming).toBe(false);
    });
  });

  describe('setContent', () => {
    it('should set content array correctly', () => {
      const state = useOutlineStore.getState();
      state.setContent(mockOutlineItems);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.content).toEqual(mockOutlineItems);
    });

    it('should update contentIds when setting content', () => {
      const state = useOutlineStore.getState();
      state.setContent(mockOutlineItems);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.contentIds).toEqual(['1', '2', '3']);
    });

    it('should handle empty array', () => {
      // First set some content
      useOutlineStore.setState({ content: mockOutlineItems, contentIds: ['1', '2', '3'] });

      const state = useOutlineStore.getState();
      state.setContent([]);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.content).toEqual([]);
      expect(updatedState.contentIds).toEqual([]);
    });
  });

  describe('Streaming Methods', () => {
    it('should set isStreaming to true when startStreaming is called', () => {
      const state = useOutlineStore.getState();
      state.startStreaming();

      const updatedState = useOutlineStore.getState();
      expect(updatedState.isStreaming).toBe(true);
    });

    it('should set isStreaming to false when endStreaming is called', () => {
      // First set streaming to true
      useOutlineStore.setState({ isStreaming: true });

      const state = useOutlineStore.getState();
      state.endStreaming();

      const updatedState = useOutlineStore.getState();
      expect(updatedState.isStreaming).toBe(false);
    });
  });

  describe('Content Manipulation', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        content: mockOutlineItems,
        contentIds: ['1', '2', '3'],
      });
    });

    describe('addContent', () => {
      it('should add new content item', () => {
        const newItem: OutlineItem = {
          id: '4',
          htmlContent: '<p>New content</p>',
          markdownContent: 'New content',
        };

        const state = useOutlineStore.getState();
        state.addContent(newItem);

        const updatedState = useOutlineStore.getState();
        expect(updatedState.content).toHaveLength(4);
        expect(updatedState.content[3]).toEqual(newItem);
        expect(updatedState.contentIds).toContain('4');
      });

      it('should maintain existing content when adding new item', () => {
        const newItem: OutlineItem = {
          id: '4',
          htmlContent: '<p>New content</p>',
          markdownContent: 'New content',
        };

        const state = useOutlineStore.getState();
        state.addContent(newItem);

        const updatedState = useOutlineStore.getState();
        expect(updatedState.content.slice(0, 3)).toEqual(mockOutlineItems);
      });
    });

    describe('deleteContent', () => {
      it('should delete content by id', () => {
        const state = useOutlineStore.getState();
        state.deleteContent('2');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.content).toHaveLength(2);
        expect(updatedState.content.find((item) => item.id === '2')).toBeUndefined();
        expect(updatedState.contentIds).not.toContain('2');
      });

      it('should not affect other content when deleting', () => {
        const state = useOutlineStore.getState();
        state.deleteContent('2');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.content.find((item) => item.id === '1')).toBeDefined();
        expect(updatedState.content.find((item) => item.id === '3')).toBeDefined();
        expect(updatedState.contentIds).toContain('1');
        expect(updatedState.contentIds).toContain('3');
      });

      it('should handle deleting non-existent id gracefully', () => {
        const state = useOutlineStore.getState();
        const originalLength = state.content.length;

        state.deleteContent('non-existent');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.content).toHaveLength(originalLength);
      });
    });

    describe('getContent', () => {
      it('should return content item by id', () => {
        const state = useOutlineStore.getState();
        const item = state.getContent('2');

        expect(item).toBeDefined();
        expect(item?.id).toBe('2');
        expect(item?.markdownContent).toBe('## Subtitle 2');
      });

      it('should return undefined for non-existent id', () => {
        const state = useOutlineStore.getState();
        const item = state.getContent('non-existent');

        expect(item).toBeUndefined();
      });
    });
  });

  describe('handleContentChange', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        content: mockOutlineItems,
        contentIds: ['1', '2', '3'],
      });
    });

    it('should update markdownContent for specified id', () => {
      const state = useOutlineStore.getState();
      state.handleContentChange?.('2', '## Updated Subtitle');

      const updatedState = useOutlineStore.getState();
      const updatedItem = updatedState.content.find((item) => item.id === '2');

      expect(updatedItem?.markdownContent).toBe('## Updated Subtitle');
      expect(updatedItem?.htmlContent).toBe('<h2>Subtitle 2</h2>'); // Should remain unchanged
      expect(updatedItem?.id).toBe('2'); // Should remain unchanged
    });

    it('should not affect other content items', () => {
      const state = useOutlineStore.getState();
      state.handleContentChange?.('2', '## Updated Subtitle');

      const updatedState = useOutlineStore.getState();
      const item1 = updatedState.content.find((item) => item.id === '1');
      const item3 = updatedState.content.find((item) => item.id === '3');

      expect(item1?.markdownContent).toBe('# Title 1');
      expect(item3?.markdownContent).toBe('Content 3');
    });

    it('should handle updating non-existent id gracefully', () => {
      const state = useOutlineStore.getState();
      const originalContent = [...state.content];

      state.handleContentChange?.('non-existent', 'Updated content');

      const updatedState = useOutlineStore.getState();
      expect(updatedState.content).toEqual(originalContent);
    });
  });

  describe('swap', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        content: mockOutlineItems,
        contentIds: ['1', '2', '3'],
      });
    });

    it('should move content item to new position', () => {
      const state = useOutlineStore.getState();
      state.swap('1', '3'); // Move item with id '1' from index 0 to index 2

      const updatedState = useOutlineStore.getState();
      // After moving index 0 to 2: [item2, item3, item1]
      expect(updatedState.content[0].id).toBe('2');
      expect(updatedState.content[1].id).toBe('3');
      expect(updatedState.content[2].id).toBe('1');
    });

    it('should maintain all content items after swap', () => {
      const state = useOutlineStore.getState();
      state.swap('1', '2');

      const updatedState = useOutlineStore.getState();
      expect(updatedState.content).toHaveLength(3);

      const ids = updatedState.content.map((item) => item.id);
      expect(ids).toContain('1');
      expect(ids).toContain('2');
      expect(ids).toContain('3');
    });

    it('should handle swapping with non-existent ids gracefully', () => {
      const state = useOutlineStore.getState();

      state.swap('1', 'non-existent');

      const updatedState = useOutlineStore.getState();
      // When one id doesn't exist, arrayMove typically handles it gracefully
      // The exact behavior depends on the arrayMove implementation
      expect(updatedState.content).toHaveLength(3);
    });
  });

  describe('markdownContent', () => {
    it('should return empty string for empty content', () => {
      const state = useOutlineStore.getState();
      const markdown = state.markdownContent();

      expect(markdown).toBe('');
    });

    it('should return concatenated markdown content', () => {
      useOutlineStore.setState({
        content: mockOutlineItems,
        contentIds: ['1', '2', '3'],
      });

      const state = useOutlineStore.getState();
      const markdown = state.markdownContent();

      expect(markdown).toBe('# Title 1\n\n## Subtitle 2\n\nContent 3');
    });

    it('should call mapOutlineItemsToMarkdown with current content', async () => {
      const { mapOutlineItemsToMarkdown } = await import('../../utils');

      useOutlineStore.setState({
        content: mockOutlineItems,
        contentIds: ['1', '2', '3'],
      });

      const state = useOutlineStore.getState();
      state.markdownContent();

      expect(mapOutlineItemsToMarkdown).toHaveBeenCalledWith(mockOutlineItems);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: add, modify, swap, delete', () => {
      const state = useOutlineStore.getState();

      // Start with empty state, add content
      state.addContent(mockOutlineItems[0]);
      state.addContent(mockOutlineItems[1]);

      let currentState = useOutlineStore.getState();
      expect(currentState.content).toHaveLength(2);

      // Modify content
      state.handleContentChange?.('1', '# Modified Title');

      currentState = useOutlineStore.getState();
      expect(currentState.content[0].markdownContent).toBe('# Modified Title');

      // Add more content and move
      state.addContent(mockOutlineItems[2]);
      state.swap('1', '3'); // Move item '1' from index 0 to index 2

      currentState = useOutlineStore.getState();
      expect(currentState.content[0].id).toBe('2'); // item '2' moves to index 0
      expect(currentState.content[2].id).toBe('1'); // item '1' moves to index 2

      // Delete content
      state.deleteContent('2');

      currentState = useOutlineStore.getState();
      expect(currentState.content).toHaveLength(2);
      expect(currentState.contentIds).not.toContain('2');
    });

    it('should maintain state consistency throughout operations', () => {
      const state = useOutlineStore.getState();

      // Set initial content
      state.setContent(mockOutlineItems);

      let currentState = useOutlineStore.getState();
      expect(currentState.content.length).toBe(currentState.contentIds.length);

      // Add content
      const newItem: OutlineItem = {
        id: '4',
        htmlContent: '<p>New</p>',
        markdownContent: 'New',
      };
      state.addContent(newItem);

      currentState = useOutlineStore.getState();
      expect(currentState.content.length).toBe(currentState.contentIds.length);
      expect(currentState.contentIds[3]).toBe('4');

      // Delete content
      state.deleteContent('2');

      currentState = useOutlineStore.getState();
      expect(currentState.content.length).toBe(currentState.contentIds.length);
      expect(currentState.content.every((item) => currentState.contentIds.includes(item.id))).toBe(true);
    });
  });
});
