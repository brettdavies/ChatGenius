import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface ValidationSchema {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export function validateRequest(schema: ValidationSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (schema.body) {
        await schema.body.parseAsync(req.body);
      }

      // Validate query parameters if schema provided
      if (schema.query) {
        await schema.query.parseAsync(req.query);
      }

      // Validate URL parameters if schema provided
      if (schema.params) {
        await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        });
      }
      next(error);
    }
  };
} 