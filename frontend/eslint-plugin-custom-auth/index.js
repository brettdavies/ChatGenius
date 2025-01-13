const requireAuthErrorBoundary = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce AuthErrorBoundary usage in components using auth',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    let usesAuth = false;
    let hasErrorBoundary = false;
    let isTestFile = false;

    return {
      Program() {
        usesAuth = false;
        hasErrorBoundary = false;
        isTestFile = context.getFilename().includes('__tests__') || 
                    context.getFilename().includes('.test.') ||
                    context.getFilename().includes('.spec.');
      },
      ImportDeclaration(node) {
        if (node.source.value === '@auth0/auth0-react' || 
            node.source.value === '@/hooks/useAuth') {
          usesAuth = true;
        }
      },
      CallExpression(node) {
        if (node.callee.name === 'withAuthErrorBoundary') {
          hasErrorBoundary = true;
        }
      },
      'Program:exit'(node) {
        if (usesAuth && !hasErrorBoundary && !isTestFile) {
          context.report({
            node,
            message: 'Components using auth must be wrapped with withAuthErrorBoundary'
          });
        }
      }
    };
  }
};

const noDirectAuthHook = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct usage of useAuth hook, use useAuthWithError instead',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    fixable: 'code',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === '@auth0/auth0-react' || 
            node.source.value === '@/hooks/useAuth') {
          node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier' && 
                specifier.imported.name === 'useAuth' &&
                !node.source.value.includes('useAuthWithError')) {
              context.report({
                node: specifier,
                message: 'Use useAuthWithError instead of useAuth directly',
                fix(fixer) {
                  return [
                    fixer.replaceText(specifier, 'useAuthWithError'),
                    fixer.replaceText(node.source, "'@/hooks/useAuthWithError'")
                  ];
                }
              });
            }
          });
        }
      }
    };
  }
};

const requireProtectedRoute = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Protected component usage for authenticated routes',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    let hasProtected = false;
    let isAuthenticatedRoute = false;
    let isTestFile = false;
    let isUtilFile = false;

    return {
      Program() {
        hasProtected = false;
        isAuthenticatedRoute = false;
        const filename = context.getFilename();
        isTestFile = filename.includes('__tests__') || 
                    filename.includes('.test.') ||
                    filename.includes('.spec.');
        isUtilFile = filename.includes('.utils.') ||
                    filename.includes('/utils/') ||
                    filename.includes('/services/') ||
                    filename.includes('/hooks/') ||
                    filename.includes('/providers/') ||
                    filename.includes('/stores/');
      },
      ImportDeclaration(node) {
        if ((node.source.value === '@auth0/auth0-react' || 
             node.source.value === '@/hooks/useAuth') &&
            !isUtilFile) {
          isAuthenticatedRoute = true;
        }
      },
      JSXElement(node) {
        if (node.openingElement.name.name === 'Protected') {
          hasProtected = true;
        }
      },
      'Program:exit'(node) {
        if (isAuthenticatedRoute && !hasProtected && !isTestFile && !isUtilFile) {
          context.report({
            node,
            message: 'Routes using auth must use the Protected component'
          });
        }
      }
    };
  }
};

const noRawAuthProvider = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct usage of Auth0Provider, use AuthProvider instead',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    fixable: 'code',
  },
  create(context) {
    let isTestFile = false;
    let isAuthProviderFile = false;

    return {
      Program() {
        const filename = context.getFilename();
        isTestFile = filename.includes('__tests__') || 
                    filename.includes('.test.') ||
                    filename.includes('.spec.');
        isAuthProviderFile = filename.endsWith('AuthProvider.tsx') ||
                           filename.endsWith('AuthProvider.ts');
      },
      JSXElement(node) {
        if (node.openingElement.name.name === 'Auth0Provider' && 
            !isTestFile && 
            !isAuthProviderFile) {
          context.report({
            node,
            message: 'Use AuthProvider instead of Auth0Provider directly',
            fix(fixer) {
              return [
                fixer.replaceText(node.openingElement.name, 'AuthProvider'),
                node.closingElement && fixer.replaceText(node.closingElement.name, 'AuthProvider')
              ].filter(Boolean);
            }
          });
        }
      }
    };
  }
};

const plugin = {
  rules: {
    'require-auth-error-boundary': requireAuthErrorBoundary,
    'no-direct-auth-hook': noDirectAuthHook,
    'require-protected-route': requireProtectedRoute,
    'no-raw-auth-provider': noRawAuthProvider,
  },
  configs: {
    recommended: {
      plugins: ['custom-auth'],
      rules: {
        'custom-auth/require-auth-error-boundary': 'error',
        'custom-auth/no-direct-auth-hook': 'error',
        'custom-auth/require-protected-route': 'error',
        'custom-auth/no-raw-auth-provider': 'error',
      },
    },
  },
};

export default plugin; 