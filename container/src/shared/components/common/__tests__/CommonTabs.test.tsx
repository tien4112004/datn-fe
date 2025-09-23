import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import { renderWithProviders } from '@/tests/test-utils';

describe('CommonTabs', () => {
  const mockOnValueChange = vi.fn();

  const mockTabItems: TabItem[] = [
    {
      key: 'tab1',
      value: 'tab1',
      label: 'Tab 1',
      content: <div>Content for Tab 1</div>,
    },
    {
      key: 'tab2',
      value: 'tab2',
      label: 'Tab 2',
      content: <div>Content for Tab 2</div>,
    },
    {
      key: 'tab3',
      value: 'tab3',
      label: 'Tab 3',
      content: <div>Content for Tab 3</div>,
    },
  ];

  const defaultProps = {
    value: 'tab1',
    onValueChange: mockOnValueChange,
    items: mockTabItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab triggers', () => {
    renderWithProviders(<CommonTabs {...defaultProps} />);

    expect(screen.getByText(/^Tab\s+1$/)).toBeInTheDocument();
    expect(screen.getByText(/^Tab\s+2$/)).toBeInTheDocument();
    expect(screen.getByText(/^Tab\s+3$/)).toBeInTheDocument();
  });

  it('displays content for the active tab', () => {
    renderWithProviders(<CommonTabs {...defaultProps} />);

    expect(screen.getByText(/Content\s+for\s+Tab\s+1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Content\s+for\s+Tab\s+2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Content\s+for\s+Tab\s+3/i)).not.toBeInTheDocument();
  });

  it('calls onValueChange when a different tab is clicked', () => {
    renderWithProviders(<CommonTabs {...defaultProps} />);

    const tab2Trigger = screen.getByText(/^Tab\s+2$/);

    fireEvent.mouseDown(tab2Trigger);
    fireEvent.mouseUp(tab2Trigger);

    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    expect(mockOnValueChange).toHaveBeenCalledWith('tab2');
  });

  it('does not call onValueChange when the current active tab is clicked', () => {
    renderWithProviders(<CommonTabs {...defaultProps} />);

    const tab1Trigger = screen.getByText(/^Tab\s+1$/);

    fireEvent.mouseDown(tab1Trigger);
    fireEvent.mouseUp(tab1Trigger);

    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it('updates displayed content when value prop changes', () => {
    const { rerender } = renderWithProviders(<CommonTabs {...defaultProps} />);

    expect(screen.getByText(/Content\s+for\s+Tab\s+1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Content\s+for\s+Tab\s+2/i)).not.toBeInTheDocument();

    rerender(<CommonTabs {...defaultProps} value="tab2" />);

    expect(screen.queryByText(/Content\s+for\s+Tab\s+1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Content\s+for\s+Tab\s+2/i)).toBeInTheDocument();
  });

  it('renders with React node labels', () => {
    const itemsWithReactNodes: TabItem[] = [
      {
        key: 'tab1',
        value: 'tab1',
        label: (
          <span>
            React <strong>Node</strong> Label
          </span>
        ),
        content: <div>Content 1</div>,
      },
      {
        key: 'tab2',
        value: 'tab2',
        label: <div>Complex Label</div>,
        content: <div>Content 2</div>,
      },
    ];

    renderWithProviders(<CommonTabs {...defaultProps} items={itemsWithReactNodes} />);

    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(screen.getByText(/Complex\s+Label/i)).toBeInTheDocument();
  });

  it('renders with React node content', () => {
    const itemsWithComplexContent: TabItem[] = [
      {
        key: 'tab1',
        value: 'tab1',
        label: 'Tab 1',
        content: (
          <div>
            <h2>Complex Content</h2>
            <p>This is a paragraph</p>
            <button>Action Button</button>
          </div>
        ),
      },
    ];

    renderWithProviders(<CommonTabs {...defaultProps} items={itemsWithComplexContent} />);

    expect(screen.getByText(/Complex\s+Content/i)).toBeInTheDocument();
    expect(screen.getByText(/This\s+is\s+a\s+paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/Action\s+Button/i)).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    renderWithProviders(<CommonTabs {...defaultProps} items={[]} />);

    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toBeInTheDocument();
    expect(tabsList.children).toHaveLength(0);
  });

  it('handles single tab item', () => {
    const singleItem: TabItem[] = [
      {
        key: 'single',
        value: 'single',
        label: 'Single Tab',
        content: <div>Single Content</div>,
      },
    ];

    renderWithProviders(<CommonTabs {...defaultProps} items={singleItem} value="single" />);

    expect(screen.getByText(/Single\s+Tab/i)).toBeInTheDocument();
    expect(screen.getByText(/Single\s+Content/i)).toBeInTheDocument();
  });
});
