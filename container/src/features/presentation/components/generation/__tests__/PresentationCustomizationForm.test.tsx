import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationCustomizationForm from '@/features/presentation/components/generation/PresentationCustomizationForm';
import type { Control } from 'react-hook-form';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        themeTitle: 'Theme',
        themeDescription: 'Choose a theme for your presentation',
        viewMore: 'View More',
        'themes.business': 'Business',
        'themes.education': 'Education',
        'themes.creative': 'Creative',
        'themes.minimal': 'Minimal',
        'themes.modern': 'Modern',
        'themes.classic': 'Classic',
        contentTitle: 'Content Length',
        contentDescription: 'Choose content amount',
        'content.short': 'Short',
        'content.medium': 'Medium',
        'content.long': 'Long',
        imageModelTitle: 'Image Model',
        imageModelDescription: 'Select AI model for images',
      };
      return translations[key] || key;
    },
  })),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardAction: ({ children, ...props }: any) => (
    <div data-testid="card-action" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div data-testid="card-description" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, variant, size, className, ...props }: any) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children, ...props }: any) => (
    <div data-testid="select" {...props}>
      {children}
    </div>
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

vi.mock('lucide-react', () => ({
  Palette: () => <div data-testid="palette-icon" />,
  Briefcase: ({ className }: any) => <div data-testid="briefcase-icon" className={className} />,
  GraduationCap: ({ className }: any) => <div data-testid="graduation-cap-icon" className={className} />,
  Sparkles: ({ className }: any) => <div data-testid="sparkles-icon" className={className} />,
  Square: ({ className }: any) => <div data-testid="square-icon" className={className} />,
  Monitor: ({ className }: any) => <div data-testid="monitor-icon" className={className} />,
  BookText: ({ className }: any) => <div data-testid="book-text-icon" className={className} />,
  AlignLeft: ({ className }: any) => <div data-testid="align-left-icon" className={className} />,
  AlignCenter: ({ className }: any) => <div data-testid="align-center-icon" className={className} />,
  AlignJustify: ({ className }: any) => <div data-testid="align-justify-icon" className={className} />,
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ render, name }: any) => {
    const field = { value: '', onChange: vi.fn() };
    return <div data-testid={`controller-${name}`}>{render({ field })}</div>;
  },
}));

vi.mock('@/features/model', () => ({
  useModels: vi.fn(() => ({
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    ],
  })),
}));

type CustomizationFormData = {
  theme: string;
  contentLength: string;
  imageModel: string;
};

// Can't test this component properly due to the complexity of the form and its dependencies.
// Might consider integration tests or refactoring for better testability.
describe('PresentationCustomizationForm', () => {
  const mockControl = {} as Control<CustomizationFormData>;
  const mockWatch = vi.fn();
  const mockSetValue = vi.fn();

  const defaultProps = {
    control: mockControl,
    watch: mockWatch,
    setValue: mockSetValue,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWatch.mockReturnValue('');
  });

  it('renders theme section correctly', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Choose a theme for your presentation')).toBeInTheDocument();
    expect(screen.getByText('View More')).toBeInTheDocument();
  });

  it('renders all theme options with correct icons', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    const themeNames = ['Business', 'Education', 'Creative', 'Minimal', 'Modern', 'Classic'];
    const themeIcons = [
      'briefcase-icon',
      'graduation-cap-icon',
      'sparkles-icon',
      'square-icon',
      'monitor-icon',
      'book-text-icon',
    ];

    themeNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    themeIcons.forEach((icon) => {
      expect(screen.getByTestId(icon)).toBeInTheDocument();
    });
  });

  it('highlights selected theme', () => {
    mockWatch.mockReturnValue('business');

    render(<PresentationCustomizationForm {...defaultProps} />);

    const businessTheme = screen.getByText('Business').closest('div');
    expect(businessTheme).toHaveClass('ring-primary', 'ring-2');
  });

  it('calls setValue when theme is clicked', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    const businessTheme = screen.getByText('Business').closest('div');
    fireEvent.click(businessTheme!);

    expect(mockSetValue).toHaveBeenCalledWith('theme', 'business');
  });

  it('renders content length section correctly', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    expect(screen.getByText('Content Length')).toBeInTheDocument();
    expect(screen.getByText('Choose content amount')).toBeInTheDocument();
  });

  it('renders view more button with correct props', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    const viewMoreButton = screen.getByText('View More');
    expect(viewMoreButton).toHaveAttribute('data-variant', 'ghost');
    expect(viewMoreButton).toHaveAttribute('data-size', 'sm');
    expect(viewMoreButton).toHaveClass('shadow-none');
  });

  it('renders palette icon in view more button', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    const paletteIcon = screen.getByTestId('palette-icon');
    expect(paletteIcon).toBeInTheDocument();
  });

  it('handles multiple theme selections correctly', () => {
    const { rerender } = render(<PresentationCustomizationForm {...defaultProps} />);

    // Select business theme
    const businessTheme = screen.getByText('Business').closest('div');
    fireEvent.click(businessTheme!);
    expect(mockSetValue).toHaveBeenCalledWith('theme', 'business');

    // Mock watch to return business theme
    mockWatch.mockReturnValue('business');
    rerender(<PresentationCustomizationForm {...defaultProps} />);

    // Business should be highlighted
    expect(businessTheme).toHaveClass('ring-primary', 'ring-2');

    // Select education theme
    const educationTheme = screen.getByText('Education').closest('div');
    fireEvent.click(educationTheme!);
    expect(mockSetValue).toHaveBeenCalledWith('theme', 'education');
  });

  it('renders icons with correct size classes', () => {
    render(<PresentationCustomizationForm {...defaultProps} />);

    const themeIcons = [
      screen.getByTestId('briefcase-icon'),
      screen.getByTestId('graduation-cap-icon'),
      screen.getByTestId('sparkles-icon'),
      screen.getByTestId('square-icon'),
      screen.getByTestId('monitor-icon'),
      screen.getByTestId('book-text-icon'),
    ];

    themeIcons.forEach((icon) => {
      expect(icon).toHaveClass('h-5', 'w-5');
    });

    const contentIcons = [
      screen.getByTestId('align-left-icon'),
      screen.getByTestId('align-center-icon'),
      screen.getByTestId('align-justify-icon'),
    ];

    contentIcons.forEach((icon) => {
      expect(icon).toHaveClass('h-5', 'w-5');
    });
  });
});
