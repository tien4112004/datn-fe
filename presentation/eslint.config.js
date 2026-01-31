import base from '../eslint.base.js';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  ...base,
  globalIgnores(['dist', '.__mf__temp']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      curly: ['error', 'multi-line'],
      eqeqeq: ['error', 'always'],
      semi: ['error', 'never'],
      'no-empty': 'error',
      'no-else-return': 'error',
      'no-multi-spaces': 'error',
      'require-await': 'error',
      'brace-style': ['error', 'stroustrup'],
      'spaced-comment': ['error', 'always'],
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
    },
  },
]);
