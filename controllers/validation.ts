import { Context, Next } from 'koa';
import addFormats from 'ajv-formats';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, removeAdditional: true });
addFormats(ajv);
/**
 * Validates data against a JSON schema.
 * @param schema JSON schema
 * @param data Data to validate
 * @returns Validated data with type T
 * @throws Error if validation fails
 */
export function validate<T>(schema: object, data: unknown): T {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    throw new Error(JSON.stringify(validate.errors));
  }
  return data as T;
}

/**
 * Koa middleware for schema validation.
 * @param schema JSON schema
 * @returns Koa middleware function
 */
export const validateMiddleware = (schema: object) => {
  const validate = ajv.compile(schema);
  return async (ctx: Context, next: Next) => {
    if (!validate(ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: validate.errors?.map((err) => err.message).join(', ') || 'Validation failed' };
      return;
    }
    await next();
  };
};
