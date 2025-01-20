import { OpenAPIV3 } from 'openapi-types';

export const health: OpenAPIV3.PathItemObject = {
  get: {
    summary: 'Health check endpoint',
    tags: ['System'],
    responses: {
      200: {
        description: 'API is healthy',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message', 'code', 'data'],
              properties: {
                message: {
                  type: 'string',
                  example: 'API is healthy'
                },
                code: {
                  type: 'string',
                  example: 'HEALTH_CHECK_OK'
                },
                data: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['ok', 'degraded'],
                      example: 'ok'
                    },
                    uptime: {
                      type: 'number',
                      description: 'Server uptime in seconds'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                },
                errors: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      503: {
        description: 'API is unhealthy',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    }
  }
}; 