import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

const nodeGlobals = {
  clearInterval: 'readonly',
  console: 'readonly',
  process: 'readonly',
  setInterval: 'readonly',
};

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['node_modules/**', 'coverage/**'],
    languageOptions: { globals: nodeGlobals },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
];
