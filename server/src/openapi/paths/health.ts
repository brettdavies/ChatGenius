import { OpenAPIV3 } from 'openapi-types';

export const health: OpenAPIV3.PathItemObject = {
  get: {
    summary: 'Health check endpoint',
    tags: ['System'],
    responses: {
      '200': {
        description: 'API is healthy',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'ok'
                }
              }
            }
          }
        }
      }
    }
  }
}; 