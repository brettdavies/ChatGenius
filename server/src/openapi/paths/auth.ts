import { OpenAPIV3 } from 'openapi-types';

export const authPaths: OpenAPIV3.PathsObject = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
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
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'User registered successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'USER_REGISTERED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/UserResponse'
                      }
                    }
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        409: {
          description: 'Email or username already exists',
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
  },

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login with email/username and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['login', 'password'],
              properties: {
                login: {
                  type: 'string',
                  description: 'Email or username'
                },
                password: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Login successful'
                  },
                  code: {
                    type: 'string',
                    example: 'LOGIN_SUCCESS'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/UserResponse'
                      },
                      requires2FA: {
                        type: 'boolean'
                      }
                    }
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
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
  },

  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout current user',
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Logged out successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'LOGOUT_SUCCESS'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
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

  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user profile',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'User profile retrieved successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'PROFILE_RETRIEVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/UserResponse'
                      }
                    }
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
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
        404: {
          description: 'User not found',
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

  '/api/auth/2fa/setup': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Setup 2FA for user account',
      security: [{ session: [] }],
      responses: {
        200: {
          description: '2FA setup initialized successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA setup initialized successfully'
                  },
                  code: {
                    type: 'string',
                    example: '2FA_SETUP_INITIALIZED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      qrCodeUrl: {
                        type: 'string',
                        description: 'QR code URL for scanning'
                      },
                      backupCodes: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        description: 'Backup codes for account recovery'
                      }
                    }
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: '2FA already enabled',
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
          description: 'Too many setup attempts',
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

  '/api/auth/2fa/verify': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Verify and enable 2FA',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: {
                token: {
                  type: 'string',
                  pattern: '^[0-9]{6}$',
                  description: '6-digit TOTP token'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA verified and enabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA has been enabled successfully'
                  },
                  code: {
                    type: 'string',
                    example: '2FA_ENABLED'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid token or 2FA already enabled',
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
      tags: ['Two-Factor Authentication'],
      summary: 'Validate 2FA token during login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId', 'token'],
              properties: {
                userId: {
                  type: 'string',
                  format: 'ulid'
                },
                token: {
                  type: 'string',
                  pattern: '^[0-9]{6}$|^[0-9a-f]{8}$',
                  description: '6-digit TOTP token or 8-character backup code'
                },
                isBackupCode: {
                  type: 'boolean',
                  default: false
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA token validated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA token validated successfully'
                  },
                  code: {
                    type: 'string',
                    example: '2FA_VALIDATED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/UserResponse'
                      }
                    }
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid token or 2FA not enabled',
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
          description: 'Too many validation attempts',
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

  '/api/auth/2fa/disable': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Disable 2FA for user account',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                password: {
                  type: 'string',
                  description: 'Current password for verification'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA disabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA has been disabled successfully'
                  },
                  code: {
                    type: 'string',
                    example: '2FA_DISABLED'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid password or 2FA not enabled',
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
          description: 'Too many attempts',
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