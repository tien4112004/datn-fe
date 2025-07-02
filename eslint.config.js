import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  // never lint generated or cached output
  globalIgnores(['dist', 'coverage', '.turbo', 'node_modules']),
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // project-wide tweaks go here
      // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
]);
