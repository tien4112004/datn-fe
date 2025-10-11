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
      markdownContent: '# Title 1',
    },
    {
      id: '2',
      markdownContent: '## Subtitle 2',
    },
    {
      id: '3',
      markdownContent: 'Content 3',
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    useOutlineStore.setState({
      outlines: [],
      outlineIds: [],
      isStreaming: false,
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty outline array', () => {
      const state = useOutlineStore.getState();
      expect(state.outlines).toEqual([]);
    });

    it('should initialize with empty outlineIds array', () => {
      const state = useOutlineStore.getState();
      expect(state.outlineIds).toEqual([]);
    });

    it('should initialize with isStreaming as false', () => {
      const state = useOutlineStore.getState();
      expect(state.isStreaming).toBe(false);
    });
  });

  describe('setOutline', () => {
    it('should set outline array correctly', () => {
      const state = useOutlineStore.getState();
      state.setOutlines(mockOutlineItems);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlines).toEqual(mockOutlineItems);
    });

    it('should update contentIds when setting content', () => {
      const state = useOutlineStore.getState();
      state.setOutlines(mockOutlineItems);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlineIds).toEqual(['1', '2', '3']);
    });

    it('should handle empty array', () => {
      // First set some content
      useOutlineStore.setState({ outlines: mockOutlineItems, outlineIds: ['1', '2', '3'] });

      const state = useOutlineStore.getState();
      state.setOutlines([]);

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlines).toEqual([]);
      expect(updatedState.outlineIds).toEqual([]);
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

  describe('Outline Manipulation', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        outlines: mockOutlineItems,
        outlineIds: ['1', '2', '3'],
      });
    });

    describe('addOutline', () => {
      it('should add new outline item', () => {
        const newItem: OutlineItem = {
          id: '4',
          markdownContent: 'New content',
        };

        const state = useOutlineStore.getState();
        state.addOutline(newItem);

        const updatedState = useOutlineStore.getState();
        expect(updatedState.outlines).toHaveLength(4);
        expect(updatedState.outlines[3]).toEqual(newItem);
        expect(updatedState.outlineIds).toContain('4');
      });

      it('should maintain existing outline when adding new item', () => {
        const newItem: OutlineItem = {
          id: '4',
          markdownContent: 'New content',
        };

        const state = useOutlineStore.getState();
        state.addOutline(newItem);

        const updatedState = useOutlineStore.getState();
        expect(updatedState.outlines.slice(0, 3)).toEqual(mockOutlineItems);
      });
    });

    describe('deleteOutline', () => {
      it('should delete content by id', () => {
        const state = useOutlineStore.getState();
        state.deleteOutline('2');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.outlines).toHaveLength(2);
        expect(updatedState.outlines.find((item) => item.id === '2')).toBeUndefined();
        expect(updatedState.outlineIds).not.toContain('2');
      });

      it('should not affect other content when deleting', () => {
        const state = useOutlineStore.getState();
        state.deleteOutline('2');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.outlines.find((item) => item.id === '1')).toBeDefined();
        expect(updatedState.outlines.find((item) => item.id === '3')).toBeDefined();
        expect(updatedState.outlineIds).toContain('1');
        expect(updatedState.outlineIds).toContain('3');
      });

      it('should handle deleting non-existent id gracefully', () => {
        const state = useOutlineStore.getState();
        const originalLength = state.outlines.length;

        state.deleteOutline('non-existent');

        const updatedState = useOutlineStore.getState();
        expect(updatedState.outlines).toHaveLength(originalLength);
      });
    });

    describe('getOutline', () => {
      it('should return content item by id', () => {
        const state = useOutlineStore.getState();
        const item = state.getOutline('2');

        expect(item).toBeDefined();
        expect(item?.id).toBe('2');
        expect(item?.markdownContent).toBe('## Subtitle 2');
      });

      it('should return undefined for non-existent id', () => {
        const state = useOutlineStore.getState();
        const item = state.getOutline('non-existent');

        expect(item).toBeUndefined();
      });
    });
  });

  describe('handleOutlineChange', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        outlines: mockOutlineItems,
        outlineIds: ['1', '2', '3'],
      });
    });

    it('should update markdownContent for specified id', () => {
      const state = useOutlineStore.getState();
      state.handleMarkdownChange?.('2', '## Updated Subtitle');

      const updatedState = useOutlineStore.getState();
      const updatedItem = updatedState.outlines.find((item) => item.id === '2');

      expect(updatedItem?.markdownContent).toBe('## Updated Subtitle');
      expect(updatedItem?.id).toBe('2'); // Should remain unchanged
    });

    it('should not affect other content items', () => {
      const state = useOutlineStore.getState();
      state.handleMarkdownChange?.('2', '## Updated Subtitle');

      const updatedState = useOutlineStore.getState();
      const item1 = updatedState.outlines.find((item) => item.id === '1');
      const item3 = updatedState.outlines.find((item) => item.id === '3');

      expect(item1?.markdownContent).toBe('# Title 1');
      expect(item3?.markdownContent).toBe('Content 3');
    });

    it('should handle updating non-existent id gracefully', () => {
      const state = useOutlineStore.getState();
      const originalContent = [...state.outlines];

      state.handleMarkdownChange?.('non-existent', 'Updated content');

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlines).toEqual(originalContent);
    });
  });

  describe('swap', () => {
    beforeEach(() => {
      useOutlineStore.setState({
        outlines: mockOutlineItems,
        outlineIds: ['1', '2', '3'],
      });
    });

    it('should move content item to new position', () => {
      const state = useOutlineStore.getState();
      state.swap('1', '3'); // Move item with id '1' from index 0 to index 2

      const updatedState = useOutlineStore.getState();
      // After moving index 0 to 2: [item2, item3, item1]
      expect(updatedState.outlines[0].id).toBe('2');
      expect(updatedState.outlines[1].id).toBe('3');
      expect(updatedState.outlines[2].id).toBe('1');
    });

    it('should maintain all content items after swap', () => {
      const state = useOutlineStore.getState();
      state.swap('1', '2');

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlines).toHaveLength(3);

      const ids = updatedState.outlines.map((item) => item.id);
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
      expect(updatedState.outlines).toHaveLength(3);
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
        outlines: mockOutlineItems,
        outlineIds: ['1', '2', '3'],
      });

      const state = useOutlineStore.getState();
      const markdown = state.markdownContent();

      expect(markdown).toBe('# Title 1\n\n## Subtitle 2\n\nContent 3');
    });

    it('should call mapOutlineItemsToMarkdown with current content', async () => {
      const { mapOutlineItemsToMarkdown } = await import('../../utils');

      useOutlineStore.setState({
        outlines: mockOutlineItems,
        outlineIds: ['1', '2', '3'],
      });

      const state = useOutlineStore.getState();
      state.markdownContent();

      expect(mapOutlineItemsToMarkdown).toHaveBeenCalledWith(mockOutlineItems);
    });
  });

  describe('clearOutline', () => {
    it('should clear all outlines and outlineIds', () => {
      const state = useOutlineStore.getState();
      state.clearOutline();

      const updatedState = useOutlineStore.getState();
      expect(updatedState.outlines).toHaveLength(0);
      expect(updatedState.outlineIds).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: add, modify, swap, delete', () => {
      const state = useOutlineStore.getState();

      // Start with empty state, add content
      state.addOutline(mockOutlineItems[0]);
      state.addOutline(mockOutlineItems[1]);

      let currentState = useOutlineStore.getState();
      expect(currentState.outlines).toHaveLength(2);

      // Modify content
      state.handleMarkdownChange?.('1', '# Modified Title');

      currentState = useOutlineStore.getState();
      expect(currentState.outlines[0].markdownContent).toBe('# Modified Title');

      // Add more content and move
      state.addOutline(mockOutlineItems[2]);
      state.swap('1', '3'); // Move item '1' from index 0 to index 2

      currentState = useOutlineStore.getState();
      expect(currentState.outlines[0].id).toBe('2'); // item '2' moves to index 0
      expect(currentState.outlines[2].id).toBe('1'); // item '1' moves to index 2

      // Delete content
      state.deleteOutline('2');

      currentState = useOutlineStore.getState();
      expect(currentState.outlines).toHaveLength(2);
      expect(currentState.outlineIds).not.toContain('2');
    });

    it('should maintain state consistency throughout operations', () => {
      const state = useOutlineStore.getState();

      // Set initial content
      state.setOutlines(mockOutlineItems);

      let currentState = useOutlineStore.getState();
      expect(currentState.outlines.length).toBe(currentState.outlineIds.length);

      // Add content
      const newItem: OutlineItem = {
        id: '4',
        markdownContent: 'New',
      };
      state.addOutline(newItem);

      currentState = useOutlineStore.getState();
      expect(currentState.outlines.length).toBe(currentState.outlineIds.length);
      expect(currentState.outlineIds[3]).toBe('4');

      // Delete content
      state.deleteOutline('2');

      currentState = useOutlineStore.getState();
      expect(currentState.outlines.length).toBe(currentState.outlineIds.length);
      expect(currentState.outlines.every((item) => currentState.outlineIds.includes(item.id))).toBe(true);
    });
  });
});
