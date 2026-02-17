import { Zap, BookOpen, GraduationCap, Briefcase, Clock, Award } from 'lucide-react';

export interface MatrixPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  totalQuestions: number;
  totalPoints: number;
  difficulties: string[];
  questionTypes: string[];
  isCustom: boolean;
}

const STORAGE_KEY = 'matrix_custom_presets';
const MAX_CUSTOM_PRESETS = 10;

const DEFAULT_PRESETS: MatrixPreset[] = [
  {
    id: 'preset-quick-quiz',
    name: 'Quick Quiz',
    description: '10 questions, basic difficulty, multiple choice',
    icon: 'Zap',
    totalQuestions: 10,
    totalPoints: 50,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION'],
    questionTypes: ['MULTIPLE_CHOICE'],
    isCustom: false,
  },
  {
    id: 'preset-standard-test',
    name: 'Standard Test',
    description: '20 questions, mixed difficulties, multiple types',
    icon: 'BookOpen',
    totalQuestions: 20,
    totalPoints: 100,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION', 'APPLICATION'],
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_BLANK'],
    isCustom: false,
  },
  {
    id: 'preset-comprehensive-exam',
    name: 'Comprehensive Exam',
    description: '40 questions, all difficulties and types',
    icon: 'GraduationCap',
    totalQuestions: 40,
    totalPoints: 200,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION', 'APPLICATION'],
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_BLANK', 'OPEN_ENDED'],
    isCustom: false,
  },
  {
    id: 'preset-homework',
    name: 'Homework',
    description: '15 questions for reinforcement',
    icon: 'Briefcase',
    totalQuestions: 15,
    totalPoints: 75,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION'],
    questionTypes: ['MULTIPLE_CHOICE', 'FILL_IN_BLANK'],
    isCustom: false,
  },
  {
    id: 'preset-midterm',
    name: 'Midterm Exam',
    description: '30 questions for midterm assessment',
    icon: 'Clock',
    totalQuestions: 30,
    totalPoints: 150,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION', 'APPLICATION'],
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_BLANK', 'OPEN_ENDED'],
    isCustom: false,
  },
  {
    id: 'preset-final',
    name: 'Final Exam',
    description: '50 questions for comprehensive final assessment',
    icon: 'Award',
    totalQuestions: 50,
    totalPoints: 250,
    difficulties: ['KNOWLEDGE', 'COMPREHENSION', 'APPLICATION'],
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING', 'FILL_IN_BLANK', 'OPEN_ENDED'],
    isCustom: false,
  },
];

export function getDefaultPresets(): MatrixPreset[] {
  return DEFAULT_PRESETS;
}

export function loadCustomPresets(): MatrixPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: Omit<MatrixPreset, 'id' | 'isCustom'>): MatrixPreset | null {
  try {
    const custom = loadCustomPresets();

    // Check limit
    if (custom.length >= MAX_CUSTOM_PRESETS) {
      console.warn(`Maximum of ${MAX_CUSTOM_PRESETS} custom presets reached`);
      return null;
    }

    // Check for duplicate names
    const nameExists = [...DEFAULT_PRESETS, ...custom].some((p) => p.name === preset.name);
    if (nameExists) {
      console.warn('Preset name already exists');
      return null;
    }

    const newPreset: MatrixPreset = {
      ...preset,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };

    custom.push(newPreset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return newPreset;
  } catch (error) {
    console.error('Failed to save preset:', error);
    return null;
  }
}

export function updateCustomPreset(id: string, updates: Partial<MatrixPreset>): MatrixPreset | null {
  try {
    const custom = loadCustomPresets();
    const index = custom.findIndex((p) => p.id === id);

    if (index === -1) {
      console.warn('Preset not found');
      return null;
    }

    const updated = { ...custom[index], ...updates };
    custom[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return updated;
  } catch (error) {
    console.error('Failed to update preset:', error);
    return null;
  }
}

export function deleteCustomPreset(id: string): boolean {
  try {
    const custom = loadCustomPresets();
    const filtered = custom.filter((p) => p.id !== id);

    if (filtered.length === custom.length) {
      console.warn('Preset not found');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return false;
  }
}

export function getAllPresets(): MatrixPreset[] {
  return [...DEFAULT_PRESETS, ...loadCustomPresets()];
}

export function getPresetById(id: string): MatrixPreset | undefined {
  return getAllPresets().find((p) => p.id === id);
}

export function clearCustomPresets(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear presets:', error);
    return false;
  }
}

export function getPresetIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    Zap,
    BookOpen,
    GraduationCap,
    Briefcase,
    Clock,
    Award,
  };
  return iconMap[iconName];
}
