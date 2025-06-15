"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(255).required(),
    password: joi_1.default.string().min(8).max(255).required(),
    email: joi_1.default.string().email().required(),
    signupCode: joi_1.default.string().when('role', {
        is: 'operator',
        then: joi_1.default.string().valid('WANDERLUST2025').required(),
        otherwise: joi_1.default.string().allow('').optional(),
    }),
    role: joi_1.default.string().valid('user', 'operator').default('user'),
});
exports.loginSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).required(),
    password: joi_1.default.string().min(8).required(),
});
exports.oauthSchema = joi_1.default.object({
    code: joi_1.default.string().required(),
});
