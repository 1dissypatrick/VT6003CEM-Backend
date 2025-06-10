"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
exports.registerSchema = {
    type: 'object',
    required: ['username', 'password', 'signupCode', 'email'],
    properties: {
        username: { type: 'string', minLength: 3 },
        password: { type: 'string', minLength: 6 },
        signupCode: { type: 'string' },
        email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
};
exports.loginSchema = {
    type: 'object',
    required: ['username', 'password'],
    properties: {
        username: { type: 'string', minLength: 3 },
        password: { type: 'string', minLength: 6 },
    },
    additionalProperties: false,
};
