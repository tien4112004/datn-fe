import { moduleMethodMap } from '../components/remote/module';
import type { SlideTheme } from '../types/slide';

export let THEMES_DATA: Record<string, SlideTheme> = {};

moduleMethodMap['method']().then((mod) => {
  THEMES_DATA = (mod.default as any).getThemes();
});
