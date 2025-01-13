import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import customAuth from './eslint-plugin-custom-auth/index.js'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'custom-auth': customAuth
    },
    rules: {
      // React rules
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // TypeScript rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Import restrictions
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@/lib/api',
          importNames: ['api'],
          message: 'Please use authenticatedApi from @/lib/api/authenticatedClient instead of raw api client'
        }],
        patterns: [{
          group: ['axios'],
          message: 'Please use authenticatedApi from @/lib/api/authenticatedClient instead of axios'
        }]
      }],

      // Custom auth rules
      'custom-auth/require-auth-error-boundary': 'error',
      'custom-auth/no-direct-auth-hook': 'error',
      'custom-auth/require-protected-route': 'error',
      'custom-auth/no-raw-auth-provider': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  // Additional config for pages
  {
    files: ['**/pages/**/*.{ts,tsx}'],
    rules: {
      'custom-auth/require-auth-error-boundary': 'error'
    }
  }
)
