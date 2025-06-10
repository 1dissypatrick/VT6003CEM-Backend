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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMiddleware = void 0;
exports.validate = validate;
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default({ allErrors: true, removeAdditional: true });
(0, ajv_formats_1.default)(ajv);
/**
 * Validates data against a JSON schema.
 * @param schema JSON schema
 * @param data Data to validate
 * @returns Validated data with type T
 * @throws Error if validation fails
 */
function validate(schema, data) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }
    return data;
}
/**
 * Koa middleware for schema validation.
 * @param schema JSON schema
 * @returns Koa middleware function
 */
const validateMiddleware = (schema) => {
    const validate = ajv.compile(schema);
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!validate(ctx.request.body)) {
            ctx.status = 400;
            ctx.body = { error: ((_a = validate.errors) === null || _a === void 0 ? void 0 : _a.map((err) => err.message).join(', ')) || 'Validation failed' };
            return;
        }
        yield next();
    });
};
exports.validateMiddleware = validateMiddleware;
