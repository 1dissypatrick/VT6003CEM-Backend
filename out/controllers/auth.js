"use strict";
// import { Context, Next } from 'koa';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { validate } from './validation';
// import { registerSchema, loginSchema, RegisterData, LoginData } from '../schema/auth';
// import { findByUsername, add } from '../models/users';
// import { User } from '../schema/user.schema';
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
exports.operatorOnly = exports.authMiddleware = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("./validation");
const auth_1 = require("../schema/auth");
const users_1 = require("../models/users");
const SECRET_CODE = 'WANDERLUST2025';
const JWT_SECRET = process.env.JWT_SECRET || '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';
const register = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, signupCode, email } = (0, validation_1.validate)(auth_1.registerSchema, ctx.request.body);
        if (signupCode !== SECRET_CODE) {
            ctx.status = 403;
            ctx.body = { error: 'Invalid sign-up code' };
            return;
        }
        const existingUser = yield (0, users_1.findByUsername)(username);
        if (existingUser.length > 0) {
            ctx.status = 400;
            ctx.body = { error: 'Username already exists' };
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = {
            username,
            password: hashedPassword,
            email,
            role: 'operator',
            avatarurl: '',
            signupCode, // Pass signupCode to add
        };
        const userId = yield (0, users_1.add)(newUser);
        const token = jsonwebtoken_1.default.sign({ id: userId, username, role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
        ctx.status = 201;
        ctx.body = { token, username, email, role: 'operator' };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
exports.register = register;
const login = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = (0, validation_1.validate)(auth_1.loginSchema, ctx.request.body);
        const users = yield (0, users_1.findByUsername)(username);
        if (users.length === 0) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        const user = users[0];
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid password' };
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        ctx.status = 200;
        ctx.body = { token, id: user.id, username: user.username, role: user.role };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
exports.login = login;
const authMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { error: 'No token provided' };
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        ctx.state.user = decoded;
        yield next();
    }
    catch (error) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid token' };
    }
});
exports.authMiddleware = authMiddleware;
const operatorOnly = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) || ctx.state.user.role !== 'operator') {
        ctx.status = 403;
        ctx.body = { error: 'Operator access required' };
        return;
    }
    yield next();
});
exports.operatorOnly = operatorOnly;
