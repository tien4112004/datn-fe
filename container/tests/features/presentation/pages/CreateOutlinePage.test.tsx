import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateOutlinePage from '@/features/presentation/pages/CreateOutlinePage';

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick ?? (() => {})} {...props}>
      {children}
    </button>
  ),
}));
vi.mock('@/shared/components/ui/autosize-textarea', () => ({
  AutosizeTextarea: ({ value, onChange, ...props }: any) => (
    <textarea data-testid="autosize-textarea" value={value} onChange={onChange} {...props} />
  ),
}));
vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));
vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, ...props }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children, ...props }: any) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  SelectGroup: ({ children, ...props }: any) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, ...props }: any) => (
    <option data-testid="select-item" value={value} {...props}>
      {children}
    </option>
  ),
  SelectLabel: ({ children, ...props }: any) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <div data-testid="select-trigger" {...props}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder, ...props }: any) => (
    <span data-testid="select-value" {...props}>
      {placeholder}
    </span>
  ),
}));
vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarTrigger: (props: any) => <div data-testid="sidebar-trigger" {...props} />,
}));
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the model feature
vi.mock('@/features/model', () => ({
  useModels: () => ({
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/presentation/constants/styles', () => ({
  PRESENTATION_STYLES: [
    { value: 'business', labelKey: 'styleBusiness' },
    { value: 'education', labelKey: 'styleEducation' },
    { value: 'creative', labelKey: 'styleCreative' },
    { value: 'minimal', labelKey: 'styleMinimal' },
  ],
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockImplementation(() => ({
    data: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Mock the presentation API service
vi.mock('@/features/presentation/api', () => ({
  usePresentationApiService: () => ({
    getType: () => 'mock',
    getPresentationItems: vi.fn().mockResolvedValue([]),
  }),
}));

// Mock the model API service
vi.mock('@/features/model/api', () => ({
  useModelApiService: () => ({
    getType: () => 'mock',
    getAvailableModels: vi.fn().mockResolvedValue([
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ]),
  }),
}));

// Mock the button component from ui/button path that might be imported differently
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick ?? (() => {})} {...props}>
      {children}
    </button>
  ),
}));

describe('CreateOutlinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main elements', () => {
    render(<CreateOutlinePage />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('autosize-textarea')).toBeInTheDocument();
    const generateBtn = screen.getAllByTestId('button').find((btn) => btn.textContent === 'generateOutline');
    expect(generateBtn).toBeInTheDocument();
    expect(
      screen.getAllByTestId('card-title').some((el) => el.textContent === 'examplePromptTitle')
    ).toBeTruthy();
  });

  it('shows example prompts when prompt input is empty', () => {
    render(<CreateOutlinePage />);
    expect(
      screen.getAllByTestId('card-title').some((el) => el.textContent === 'examplePromptTitle')
    ).toBeTruthy();
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`examplePrompt${i}`)).toBeInTheDocument();
    }
  });

  it('hides example prompts when prompt input is not empty', () => {
    render(<CreateOutlinePage />);
    const textarea = screen.getByTestId('autosize-textarea');
    fireEvent.change(textarea, { target: { value: 'Some input' } });
    expect(
      screen.queryAllByTestId('card-title').some((el) => el.textContent === 'examplePromptTitle')
    ).toBeFalsy();
    for (let i = 1; i <= 6; i++) {
      expect(screen.queryByText(`examplePrompt${i}`)).not.toBeInTheDocument();
    }
  });

  it('clicking example prompt sets prompt input', () => {
    render(<CreateOutlinePage />);
    const exampleBtn = screen.getByText('examplePrompt1');
    fireEvent.click(exampleBtn);
    expect(screen.getByTestId('autosize-textarea')).toHaveValue('examplePrompt1');
  });

  it('renders all select inputs and allows selection', () => {
    render(<CreateOutlinePage />);
    // Slide count select
    expect(
      screen.getAllByTestId('select-value').some((el) => el.textContent === 'slideCountPlaceholder')
    ).toBeTruthy();
    expect(
      screen.getAllByTestId('select-label').some((el) => el.textContent === 'slideCountLabel')
    ).toBeTruthy();
    expect(
      screen.getAllByTestId('select-item').some((el) => el.textContent === '1 slideCountUnit')
    ).toBeTruthy();
    // Style select
    expect(
      screen.getAllByTestId('select-value').some((el) => el.textContent === 'stylePlaceholder')
    ).toBeTruthy();
    expect(screen.getAllByTestId('select-label').some((el) => el.textContent === 'styleLabel')).toBeTruthy();
    expect(
      screen.getAllByTestId('select-item').some((el) => el.textContent === 'styleBusiness')
    ).toBeTruthy();
    // Model select
    expect(
      screen.getAllByTestId('select-value').some((el) => el.textContent === 'modelPlaceholder')
    ).toBeTruthy();
    expect(screen.getAllByTestId('select-label').some((el) => el.textContent === 'modelLabel')).toBeTruthy();
    expect(screen.getAllByTestId('select-item').some((el) => el.textContent === 'GPT-4o Mini')).toBeTruthy();
    expect(
      screen.getAllByTestId('select-item').some((el) => el.textContent === 'Gemini 2.0 Flash')
    ).toBeTruthy();
  });

  it('calls toast when generate outline button is clicked', () => {
    const { toast } = require('sonner');
    render(<CreateOutlinePage />);
    const generateBtn = screen.getAllByTestId('button').find((btn) => btn.textContent === 'generateOutline');
    expect(generateBtn).toBeInTheDocument();

    fireEvent.click(generateBtn!);
    expect(toast).toHaveBeenCalledWith(
      'Data:',
      expect.objectContaining({
        description: expect.anything(),
      })
    );
  });
});
