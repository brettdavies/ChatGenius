module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce standardized API response format',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [{
      type: 'object',
      properties: {
        responseProperties: {
          type: 'array',
          items: { type: 'string' },
        },
        errorProperties: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    }],
  },
  create(context) {
    const options = context.options[0] || {};
    const responseProps = options.responseProperties || ['message', 'code'];
    const errorProps = options.errorProperties || ['message', 'code', 'path'];

    return {
      CallExpression(node) {
        // Check res.json() and res.send() calls
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'res' &&
          (node.callee.property.name === 'json' || node.callee.property.name === 'send')
        ) {
          const arg = node.arguments[0];
          if (!arg) return;

          // Check if it's an object literal
          if (arg.type === 'ObjectExpression') {
            const properties = arg.properties.map(p => p.key.name);
            const missingProps = responseProps.filter(prop => !properties.includes(prop));

            if (missingProps.length > 0) {
              context.report({
                node,
                message: `API response is missing required properties: ${missingProps.join(', ')}`,
              });
            }

            // Check error properties if errors array exists
            const errorsProperty = arg.properties.find(p => p.key.name === 'errors');
            if (errorsProperty && errorsProperty.value.type === 'ArrayExpression') {
              errorsProperty.value.elements.forEach(error => {
                if (error.type === 'ObjectExpression') {
                  const errorProperties = error.properties.map(p => p.key.name);
                  const missingErrorProps = errorProps.filter(prop => !errorProperties.includes(prop));

                  if (missingErrorProps.length > 0) {
                    context.report({
                      node: error,
                      message: `Error object is missing required properties: ${missingErrorProps.join(', ')}`,
                    });
                  }
                }
              });
            }
          }
        }
      },
    };
  },
}; 