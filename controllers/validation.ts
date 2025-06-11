// src/controllers/validation.ts
import Joi from 'joi';
import { Context, Next } from 'koa';

/**
 * Validates data against a Joi schema.
 * @param schema Joi schema
 * @param data Data to validate
 * @returns Validated data with type T
 * @throws Error if validation fails
 */
export function validate<T>(schema: Joi.Schema, data: unknown): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false, // Report all errors
    stripUnknown: true, // Remove unknown properties
    allowUnknown: false, // Disallow unknown properties for strict validation
  });
  if (error) {
    throw new Error(`Validation failed: ${error.details.map((d) => d.message).join(', ')}`);
  }
  return value as T;
}

/**
 * Koa middleware for Joi schema validation.
 * @param schema Joi schema
 * @returns Koa middleware function
 */
export const validateMiddleware = (schema: Joi.Schema) => {
  return async (ctx: Context, next: Next) => {
    try {
      ctx.request.body = validate(schema, ctx.request.body);
      await next();
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: (error as Error).message };
    }
  };
};