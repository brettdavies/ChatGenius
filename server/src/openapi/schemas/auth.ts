import { OpenAPIV3 } from 'openapi-types';

/**
 * Rate limiting information for authentication endpoints
 * - Login/Register: 5 requests per 15 minutes
 * - 2FA validation: 3 requests per 5 minutes
 * - Other auth endpoints: 30 requests per 15 minutes
 */

// Export individual schemas
export const RegisterRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['email', 'password', 'username'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
      example: 'john.doe@example.com'
    },
    password: {
      type: 'string',
      minLength: 8,
      description: 'User password (min 8 characters)',
      example: 'secureP@ssw0rd'
    },
    username: {
      type: 'string',
      minLength: 3,
      description: 'Username (min 3 characters)',
      example: 'johndoe'
    },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      description: 'User role (defaults to "user")',
      example: 'user'
    }
  }
};

export const LoginRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
      example: 'john.doe@example.com'
    },
    password: {
      type: 'string',
      description: 'User password',
      example: 'secureP@ssw0rd'
    }
  }
};

export const UpdateUserRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'New email address',
      example: 'new.email@example.com'
    },
    password: {
      type: 'string',
      minLength: 8,
      description: 'New password (min 8 characters)',
      example: 'newSecureP@ssw0rd'
    },
    username: {
      type: 'string',
      minLength: 3,
      description: 'New username (min 3 characters)',
      example: 'newusername'
    },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      description: 'New user role',
      example: 'admin'
    }
  }
};

export const TOTPSetupResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['qrCodeUrl', 'backupCodes'],
  properties: {
    qrCodeUrl: {
      type: 'string',
      description: 'Data URL of QR code for scanning with authenticator app',
      example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
    },
    backupCodes: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'List of backup codes for account recovery',
      example: ['12345678', '87654321']
    }
  }
};

export const TOTPVerifyRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['token'],
  properties: {
    token: {
      type: 'string',
      pattern: '^[0-9]{6}$',
      description: '6-digit TOTP token',
      example: '123456'
    }
  }
};

export const TOTPValidateRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['email', 'token'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
      example: 'john.doe@example.com'
    },
    token: {
      type: 'string',
      pattern: '^[0-9]{6}$|^[0-9a-f]{8}$',
      description: '6-digit TOTP token or 8-character backup code',
      example: '123456'
    },
    isBackupCode: {
      type: 'boolean',
      description: 'Whether the token is a backup code',
      example: false
    }
  }
};

export const TOTPDisableRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['password'],
  properties: {
    password: {
      type: 'string',
      description: 'Current password for verification',
      example: 'secureP@ssw0rd'
    }
  }
};

export const UserResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      format: 'ulid',
      description: 'User ID',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
      example: 'john.doe@example.com'
    },
    username: {
      type: 'string',
      description: 'Username',
      example: 'johndoe'
    },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      description: 'User role',
      example: 'user'
    },
    totpEnabled: {
      type: 'boolean',
      description: 'Whether 2FA is enabled',
      example: false
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Account creation timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    deletedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Account deletion timestamp',
      example: null
    }
  }
};

export const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message', 'code'],
  properties: {
    message: {
      type: 'string',
      description: 'Error message',
      example: 'Invalid verification code'
    },
    code: {
      type: 'string',
      description: 'Error code',
      example: 'INVALID_TOKEN',
      enum: [
        'INVALID_CREDENTIALS',
        'USER_NOT_FOUND',
        'EMAIL_TAKEN',
        'INVALID_TOKEN',
        '2FA_ALREADY_ENABLED',
        '2FA_NOT_ENABLED',
        '2FA_NOT_SETUP',
        'INVALID_PASSWORD',
        'UNAUTHORIZED',
        'RATE_LIMIT_EXCEEDED'
      ]
    }
  }
};

export const LoginResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
};

export const RegisterResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
};

export const UserProfileResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
};

// Keep the authSchemas object for reference and reuse
export const authSchemas = {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UpdateUserRequest,
  UserProfileResponse,
  TOTPSetupResponse,
  TOTPVerifyRequest,
  TOTPValidateRequest,
  TOTPDisableRequest,
  UserResponse,
  ErrorResponse
};

// Export paths separately
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
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
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
        }
      }
    }
  },

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Log in a user',
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
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
                  }
                }
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
        }
      }
    }
  },

  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get user profile',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          },
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
                  }
                }
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
        }
      }
    },
    put: {
      tags: ['Authentication'],
      summary: 'Update user profile',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          },
          description: 'User ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User profile updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
                  }
                }
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
        }
      }
    },
    delete: {
      tags: ['Authentication'],
      summary: 'Delete user account',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          },
          description: 'User ID'
        }
      ],
      responses: {
        204: {
          description: 'User account deleted successfully'
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
        }
      }
    }
  },

  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Log out current user',
      responses: {
        204: {
          description: 'Logged out successfully'
        },
        500: {
          description: 'Error during logout',
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
          description: 'Invalid token, 2FA already enabled, or not set up',
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
        }
      }
    }
  },

  '/api/auth/2fa/validate': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Validate 2FA token during login',
      description: 'Validates a TOTP token or backup code during the login process. Required for users with 2FA enabled.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TOTPValidateRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Token validated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Token validated successfully'
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
        429: {
          description: 'Too many validation attempts',
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
      summary: 'Disable 2FA',
      description: 'Disables 2FA for the user\'s account. Requires password confirmation for security.',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TOTPDisableRequest'
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
                properties: {
                  message: {
                    type: 'string',
                    example: '2FA has been disabled successfully'
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
        429: {
          description: 'Too many attempts',
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
} as const; 