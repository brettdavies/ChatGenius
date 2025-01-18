import { OpenAPIV3 } from 'openapi-types';

export const authPaths: OpenAPIV3.PathsObject = {
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful or 2FA required',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/UserResponse'
                      },
                      requiresTwoFactor: {
                        type: 'boolean',
                        example: false
                      }
                    },
                    required: ['user', 'requiresTwoFactor']
                  },
                  {
                    type: 'object',
                    properties: {
                      requiresTwoFactor: {
                        type: 'boolean',
                        example: true
                      },
                      userId: {
                        type: 'string',
                        format: 'ulid'
                      },
                      message: {
                        type: 'string',
                        example: 'Two-factor authentication required'
                      }
                    },
                    required: ['requiresTwoFactor', 'userId', 'message']
                  }
                ]
              }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register new user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Registration successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterResponse'
              }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        '409': {
          description: 'Email already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user profile',
      security: [{ session: [] }],
      responses: {
        '200': {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse'
              }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      security: [{ session: [] }],
      responses: {
        '204': {
          description: 'Logout successful'
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/2fa/setup': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Initialize 2FA setup',
      description: 'Generates a TOTP secret and QR code for the user to scan with their authenticator app. Also provides backup codes for account recovery.',
      security: [{ session: [] }],
      responses: {
        200: {
          description: '2FA setup initialized successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TOTPSetupResponse'
              }
            }
          }
        },
        400: {
          description: '2FA already enabled or setup failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/2fa/verify': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Verify and enable 2FA',
      description: 'Verifies the provided TOTP token and enables 2FA for the user\'s account. This must be called after setup to complete 2FA activation.',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TOTPVerifyRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA enabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA has been enabled successfully'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid token, 2FA already enabled, or setup not initiated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        429: {
          description: 'Too many verification attempts',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/2fa/validate': {
    post: {
      tags: ['Authentication'],
      summary: 'Validate 2FA token during login',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  format: 'ulid',
                  description: 'User ID from the login response'
                },
                token: {
                  type: 'string',
                  description: 'TOTP token or backup code'
                },
                isBackupCode: {
                  type: 'boolean',
                  description: 'Whether the token is a backup code',
                  default: false
                }
              },
              required: ['userId', 'token']
            }
          }
        }
      },
      responses: {
        '200': {
          description: '2FA validation successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
                  },
                  message: {
                    type: 'string',
                    example: 'Two-factor authentication successful'
                  }
                },
                required: ['user', 'message']
              }
            }
          }
        },
        '400': {
          description: 'Invalid request or 2FA not enabled',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          description: 'Invalid token or backup code',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '429': {
          description: 'Too many validation attempts',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/2fa/confirm': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Confirm backup codes saved and enable 2FA',
      description: 'Completes the 2FA setup process by confirming backup codes are saved and enabling 2FA for the user.',
      security: [{ session: [] }],
      responses: {
        200: {
          description: '2FA enabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA has been enabled successfully'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Token not verified or setup not initiated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  }
}; 