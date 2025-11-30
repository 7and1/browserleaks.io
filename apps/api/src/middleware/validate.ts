import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';
import { logger } from './logger';

// Validation target types
type ValidationTarget = 'body' | 'query' | 'params';

// Validation options
interface ValidateOptions {
  stripUnknown?: boolean;
  partial?: boolean;
}

// Generic validation middleware factory
export function validate<T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = 'body',
  options: ValidateOptions = {}
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];

      // Apply options - use the schema directly
      const finalSchema: ZodSchema = schema;

      // Parse and validate
      const validated = await finalSchema.parseAsync(data);

      // Replace request data with validated data
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = formatZodErrors(error);
        logger.debug('Validation failed', {
          requestId: req.requestId,
          target,
          errors: fields,
        });
        next(new ValidationError('Validation failed', { fields }));
      } else {
        next(error);
      }
    }
  };
}

// Format Zod errors for response
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path || '_root';
    if (!errors[key]) {
      errors[key] = [];
    }
    errors[key].push(issue.message);
  }

  return errors;
}

// Validate body shorthand
export function validateBody<T extends ZodSchema>(schema: T, options?: ValidateOptions) {
  return validate(schema, 'body', options);
}

// Validate query shorthand
export function validateQuery<T extends ZodSchema>(schema: T, options?: ValidateOptions) {
  return validate(schema, 'query', options);
}

// Validate params shorthand
export function validateParams<T extends ZodSchema>(schema: T, options?: ValidateOptions) {
  return validate(schema, 'params', options);
}

// Common validation schemas
export const schemas = {
  // IP address validation
  ipAddress: z.string().ip({ message: 'Invalid IP address format' }),

  // UUID validation
  uuid: z.string().uuid({ message: 'Invalid UUID format' }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Sort options
  sort: z.object({
    field: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  ),

  // Fingerprint data
  fingerprint: z.object({
    visitorId: z.string().min(1),
    components: z.record(z.unknown()),
    timestamp: z.number().positive(),
    confidence: z.number().min(0).max(1).optional(),
  }),

  // Privacy test results
  testResult: z.object({
    testId: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'error']),
    score: z.number().min(0).max(100),
    data: z.record(z.unknown()),
    issues: z.array(z.string()).optional(),
    duration: z.number().positive().optional(),
  }),
};

// Export validation middleware
export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  schemas,
};
