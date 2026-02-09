import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroEslintParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astroPlugin.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Astro: 'readonly',
        browser: true,
        node: true,
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-warning-comments': ['error', { 
        terms: ['eslint-disable-next-line', 'eslint-disable', 'eslint-enable'],
        location: 'anywhere'
      }],
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '*.config.js',
      '*.config.mjs',
      'public/',
      '.devbox/'
    ],
  }
);