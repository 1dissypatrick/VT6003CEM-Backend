"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const validation_1 = require("../controllers/validation");
const user_schema_1 = require("../schema/user.schema");
const model = __importStar(require("../models/users"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../schema/auth");
const prefix = '/api/v1/users';
const router = new koa_router_1.default({ prefix });
exports.router = router;
/**
 * Get all users (operator only).
 */
const getAll = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = '20', page = '1' } = ctx.request.query;
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const users = yield model.getAll(limitNum, pageNum);
    ctx.body = users;
    yield next();
});
/**
 * Search users by field (operator only).
 */
const doSearch = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { limit = '50', page = '1', fields = '', q = '' } = ctx.request.query;
    let limitNum = parseInt(limit, 10);
    let pageNum = parseInt(page, 10);
    limitNum = limitNum > 200 ? 200 : limitNum < 1 ? 10 : limitNum;
    pageNum = pageNum < 1 ? 1 : pageNum;
    if (((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === 'operator') {
        let result;
        if (q) {
            result = yield model.getSearch(fields, q);
        }
        else {
            result = yield model.getAll(limitNum, pageNum);
        }
        if (result.length && fields) {
            const fieldArray = Array.isArray(fields) ? fields : [fields];
            const filteredResult = result.map((record) => {
                const partial = {};
                for (const field of fieldArray) {
                    if (field in record) {
                        partial[field] = record[field]; // Use type assertion if necessary
                    }
                }
                return partial;
            });
            ctx.body = filteredResult;
        }
        else {
            ctx.body = result;
        }
    }
    else {
        ctx.status = 401;
        ctx.body = { error: `${((_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.role) || 'unauthenticated'} role is not authorized` };
    }
    yield next();
});
/**
 * Get a user by ID.
 */
const getById = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const id = parseInt(ctx.params.id, 10);
    if (((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === 'operator' || ((_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.id) === id) {
        const user = yield model.getByUserId(id);
        if (user) {
            ctx.body = user;
        }
        else {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
        }
    }
    else {
        ctx.status = 401;
        ctx.body = { error: `${((_c = ctx.state.user) === null || _c === void 0 ? void 0 : _c.role) || 'unauthenticated'} role is not authorized` };
    }
    yield next();
});
/**
 * Create a new operator.
 */
const createUser = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, auth_1.register)(ctx, next);
});
/**
 * Update a user by ID.
 */
const updateUser = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(ctx.params.id, 10);
    const userData = ctx.request.body;
    if (((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === 'operator' || ((_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.id) === id) {
        try {
            const result = yield model.update(userData, id);
            if (result.status === 201) {
                ctx.status = 201;
                ctx.body = { message: `User with id ${id} updated` };
            }
            else {
                ctx.status = 404;
                ctx.body = { error: 'User not found' };
            }
        }
        catch (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }
    else {
        ctx.status = 401;
        ctx.body = { error: 'Profile records can be updated by its owner or operator role' };
    }
    yield next();
});
/**
 * Delete a user by ID.
 */
const deleteUser = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(ctx.params.id, 10);
    if (((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === 'operator' || ((_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.id) === id) {
        try {
            const result = yield model.deleteById(id);
            if (result.affectedRows) {
                ctx.status = 201;
                ctx.body = { message: `User with id ${id} deleted` };
            }
            else {
                ctx.status = 404;
                ctx.body = { error: 'User not found' };
            }
        }
        catch (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }
    else {
        ctx.status = 401;
        ctx.body = { error: 'Profile records can be deleted by its owner or operator role' };
    }
    yield next();
});
router.get('/', auth_1.authMiddleware, auth_1.operatorOnly, getAll);
router.get('/search', auth_1.authMiddleware, auth_1.operatorOnly, doSearch);
router.post('/', (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(auth_2.registerSchema), createUser);
router.get('/:id([0-9]{1,})', auth_1.authMiddleware, getById);
router.put('/:id([0-9]{1,})', auth_1.authMiddleware, (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(user_schema_1.userSchema), updateUser);
router.delete('/:id([0-9]{1,})', auth_1.authMiddleware, deleteUser);
router.post('/login', (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(auth_2.loginSchema), auth_1.login);
router.post('/oauth/google', (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(auth_2.oauthSchema), auth_1.oauthGoogle); // New OAuth endpoint
