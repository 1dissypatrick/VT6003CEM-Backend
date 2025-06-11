"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMiddleware = void 0;
exports.validate = validate;
/**
 * Validates data against a Joi schema.
 * @param schema Joi schema
 * @param data Data to validate
 * @returns Validated data with type T
 * @throws Error if validation fails
 */
function validate(schema, data) {
    const { error, value } = schema.validate(data, {
        abortEarly: false, // Report all errors
        stripUnknown: true, // Remove unknown properties
        allowUnknown: false, // Disallow unknown properties for strict validation
    });
    if (error) {
        throw new Error(`Validation failed: ${error.details.map((d) => d.message).join(', ')}`);
    }
    return value;
}
/**
 * Koa middleware for Joi schema validation.
 * @param schema Joi schema
 * @returns Koa middleware function
 */
const validateMiddleware = (schema) => {
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            ctx.request.body = validate(schema, ctx.request.body);
            yield next();
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = { error: error.message };
        }
    });
};
exports.validateMiddleware = validateMiddleware;
