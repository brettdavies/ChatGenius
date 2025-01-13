module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Enforce using authenticated API calls
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
    
    // Other rules...
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 