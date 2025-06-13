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
const auth_1 = require("../controllers/auth");
const validation_1 = require("../controllers/validation");
const favorite_schema_1 = require("../schema/favorite.schema");
const model = __importStar(require("../models/favorites"));
const prefix = '/api/v1/favorites';
const router = new koa_router_1.default({ prefix });
exports.router = router;
/**
 * Add a hotel to user's favorites.
 */
const addFavorite = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = ctx.request.body;
    const userId = ctx.state.user.id;
    console.log('addFavorite: Adding favorite for userId=', userId, 'hotelId=', hotelId);
    try {
        const favorite = yield model.add(userId, hotelId);
        ctx.status = 201;
        ctx.body = favorite;
    }
    catch (error) {
        console.error('addFavorite: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
/**
 * Get all favorites for the authenticated user.
 */
const getFavorites = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.state.user.id;
    console.log('getFavorites: Retrieving favorites for userId=', userId);
    try {
        const favorites = yield model.getByUserId(userId);
        ctx.status = 200;
        ctx.body = favorites;
    }
    catch (error) {
        console.error('getFavorites: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
/**
 * Remove a hotel from user's favorites.
 */
const removeFavorite = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hotelId = parseInt(ctx.params.hotelId, 10);
    const userId = ctx.state.user.id;
    console.log('removeFavorite: Removing favorite for userId=', userId, 'hotelId=', hotelId);
    if (isNaN(hotelId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid hotel ID' };
        return;
    }
    try {
        const result = yield model.remove(userId, hotelId);
        if (result.rowsAffected === 0) {
            ctx.status = 404;
            ctx.body = { error: 'Favorite not found' };
        }
        else {
            ctx.status = 200;
            ctx.body = { message: 'Favorite removed successfully' };
        }
    }
    catch (error) {
        console.error('removeFavorite: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
router.post('/', auth_1.authMiddleware, (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(favorite_schema_1.favoriteSchema), addFavorite);
router.get('/', auth_1.authMiddleware, getFavorites);
router.delete('/:hotelId([0-9]{1,})', auth_1.authMiddleware, removeFavorite);
