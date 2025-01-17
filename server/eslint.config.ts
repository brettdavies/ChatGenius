import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  // Base configuration for all files
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // JavaScript and TypeScript files
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      node: {
        tryExtensions: ['.ts', '.js', '.json'],
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Import rules
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/order': ['error', {
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      }],

      // Error handling
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Code style
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
      ],
    },
  },

  // Test files
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Apply Prettier config last
  eslintConfigPrettier,
]; 