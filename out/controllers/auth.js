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
exports.operatorOnly = exports.authMiddleware = exports.oauthGoogle = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../models/users");
const google_auth_library_1 = require("google-auth-library");
const SECRET_CODE = 'WANDERLUST2025';
const JWT_SECRET = process.env.JWT_SECRET || '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'; // Set in .env
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
const register = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('register: Request body:', ctx.request.body);
        const { username, password, signupCode, email, role = 'user' } = ctx.request.body;
        console.log('register: Validated data:', { username, password, signupCode, email, role });
        if (role === 'operator') {
            if (!signupCode || signupCode.toUpperCase() !== SECRET_CODE) {
                ctx.status = 403;
                ctx.body = { error: 'Invalid signup code' };
                return;
            }
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
            role,
            avatarurl: null,
            signupCode: role === 'operator' ? signupCode : null,
        };
        console.log('register: New user to add:', newUser);
        try {
            const userId = yield (0, users_1.add)(newUser);
            const token = jsonwebtoken_1.default.sign({ id: userId, username, role }, JWT_SECRET, { expiresIn: '1h' });
            ctx.status = 201;
            ctx.body = { token, username, email, role, avatarurl: null };
        }
        catch (dbError) {
            console.error('register: Database error:', dbError);
            ctx.status = 500;
            ctx.body = { error: 'Failed to create user: ' + dbError.message };
            return;
        }
    }
    catch (error) {
        console.error('register: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
exports.register = register;
const login = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('login: Request body:', ctx.request.body);
        const { username, password } = ctx.request.body;
        const users = yield (0, users_1.findByUsername)(username);
        console.log('login: Users found:', users);
        if (!users.length) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        const user = users[0];
        if (!user || !user.password) {
            ctx.status = 400;
            ctx.body = { error: 'User data incomplete' };
            return;
        }
        console.log('login: Comparing password for user:', username);
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        console.log('login: Password valid:', isValid);
        if (!isValid) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid password' };
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('login: Token generated for user:', username);
        ctx.status = 200;
        ctx.body = { token, id: user.id, username: user.username, role: user.role, email: user.email, avatarurl: user.avatarurl };
    }
    catch (error) {
        console.error('login: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
exports.login = login;
const oauthGoogle = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = ctx.request.body; // Google OAuth2 code from frontend
        console.log('oauthGoogle: Received code:', code);
        if (!code) {
            ctx.status = 400;
            ctx.body = { error: 'No authorization code provided' };
            return;
        }
        const { tokens } = yield client.getToken(code); // Exchange code for tokens
        console.log('oauthGoogle: Tokens received:', tokens);
        if (!tokens || !tokens.id_token) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid token response from Google' };
            return;
        }
        const ticket = yield client.verifyIdToken({
            idToken: tokens.id_token, // Assert as string, handle null case above
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('oauthGoogle: Payload:', payload);
        if (!payload || !payload.email || !payload.name) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid Google token payload' };
            return;
        }
        const username = payload.name.replace(/\s+/g, '_').toLowerCase(); // Sanitize username from name
        const email = payload.email;
        const existingUser = yield (0, users_1.findByUsername)(username);
        let userId;
        if (existingUser.length > 0) {
            const user = existingUser[0];
            if (user.role === 'operator') {
                ctx.status = 403;
                ctx.body = { error: 'Operators cannot use external authentication' };
                return;
            }
            userId = user.id;
        }
        else {
            const newUser = {
                username,
                password: '', // No password for OAuth users
                email,
                role: 'user', // Force role to user for OAuth
                avatarurl: payload.picture || null,
            };
            console.log('oauthGoogle: New user to add:', newUser);
            userId = yield (0, users_1.add)(newUser);
        }
        const token = jsonwebtoken_1.default.sign({ id: userId, username, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
        ctx.status = 200;
        ctx.body = { token, id: userId, username, role: 'user', email, avatarurl: payload.picture || null };
    }
    catch (error) {
        console.error('oauthGoogle: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
exports.oauthGoogle = oauthGoogle;
const authMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('authMiddleware: Method:', ctx.method, 'Path:', ctx.path, 'Auth:', ctx.headers.authorization);
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('authMiddleware: No token provided');
        ctx.status = 401;
        ctx.body = { error: 'No token provided' };
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('authMiddleware: Decoded token:', decoded);
        ctx.state.user = decoded;
        yield next();
    }
    catch (error) {
        console.error('authMiddleware: Invalid token:', error);
        ctx.status = 401;
        ctx.body = { error: 'Invalid token' };
    }
});
exports.authMiddleware = authMiddleware;
const operatorOnly = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('operatorOnly: User:', ctx.state.user);
    if (!((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) || ctx.state.user.role !== 'operator') {
        console.log('operatorOnly: Access denied, role:', (_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.role);
        ctx.status = 403;
        ctx.body = { error: 'Operator access required' };
        return;
    }
    yield next();
});
exports.operatorOnly = operatorOnly;
