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
const hotel_1 = require("../schema/hotel");
const model = __importStar(require("../models/hotels"));
const axios_1 = __importDefault(require("axios"));
const prefix = '/api/v1/hotels';
const router = new koa_router_1.default({ prefix });
exports.router = router;
const postToSocialMedia = (hotel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.post('https://api.mock-social-media.com/post', {
            message: `New hotel listed: ${hotel.name} in ${hotel.location} for $${hotel.price}/night!`,
        });
        console.log(`Posted to social media: ${hotel.name}`);
    }
    catch (error) {
        console.error('Failed to post to social media:', error.message);
    }
});
const injectCreatedBy = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('injectCreatedBy: User:', ctx.state.user);
    if ((_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.id) {
        const body = ctx.request.body;
        body.createdBy = ctx.state.user.id;
        ctx.request.body = body;
    }
    else {
        ctx.status = 401;
        ctx.body = { error: 'User not authenticated' };
        return;
    }
    yield next();
});
const getAll = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = '10', page = '1', search = '', location = '', minPrice, maxPrice } = ctx.request.query;
    console.log('getAll: Query params:', { limit, page, search, location, minPrice, maxPrice });
    try {
        const hotels = yield model.getAll(parseInt(limit, 10), parseInt(page, 10), search, location, minPrice ? parseFloat(minPrice) : undefined, maxPrice ? parseFloat(maxPrice) : undefined);
        console.log('getAll: Hotels retrieved:', hotels, 'Count:', hotels.length);
        ctx.status = 200;
        ctx.body = hotels;
    }
    catch (error) {
        console.error('getAll: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
const getById = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(ctx.params.id, 10);
    console.log('getById: Hotel ID:', id);
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid hotel ID' };
        return;
    }
    try {
        const hotel = yield model.getById(id);
        console.log('getById: Hotel retrieved:', hotel);
        if (hotel) {
            ctx.status = 200;
            ctx.body = hotel;
        }
        else {
            ctx.status = 404;
            ctx.body = { error: 'Hotel not found' };
        }
    }
    catch (error) {
        console.error('getById: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
const createHotel = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hotel = ctx.request.body;
    const { postToSocial = false } = ctx.request.body;
    console.log('createHotel: Hotel data:', hotel, 'postToSocial:', postToSocial);
    try {
        const result = yield model.add(hotel);
        console.log('createHotel: Result:', result);
        if (result.status === 201) {
            const newHotel = Object.assign(Object.assign({}, hotel), { id: result.data });
            if (postToSocial) {
                yield postToSocialMedia(newHotel);
            }
            ctx.status = 201;
            ctx.body = newHotel;
        }
        else {
            ctx.status = 400;
            ctx.body = { error: 'Failed to create hotel' };
        }
    }
    catch (error) {
        console.error('createHotel: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
const updateHotel = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(ctx.params.id, 10);
    console.log('updateHotel: Hotel ID:', id);
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid hotel ID' };
        return;
    }
    const hotel = ctx.request.body;
    console.log('updateHotel: Hotel data:', hotel);
    try {
        const result = yield model.update(hotel, id);
        console.log('updateHotel: Result:', result);
        if (result.status === 200) {
            ctx.status = 200;
            ctx.body = result.data;
        }
        else {
            ctx.status = 404;
            ctx.body = { error: 'Hotel not found' };
        }
    }
    catch (error) {
        console.error('updateHotel: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
const deleteHotel = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(ctx.params.id, 10);
    console.log('deleteHotel: Attempting to delete hotel id=', id);
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid hotel ID' };
        return;
    }
    try {
        const result = yield model.deleteById(id);
        console.log('deleteHotel: Result for id=', id, ':', result);
        ctx.status = result.status;
        ctx.body = result.status === 200 ? { message: `Hotel with id ${id} deleted` } : { error: 'Hotel not found' };
    }
    catch (error) {
        console.error('deleteHotel: Error for id=', id, ':', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', (0, koa_bodyparser_1.default)(), auth_1.authMiddleware, auth_1.operatorOnly, injectCreatedBy, (0, validation_1.validateMiddleware)(hotel_1.hotelSchema), createHotel);
router.put('/:id([0-9]{1,})', (0, koa_bodyparser_1.default)(), auth_1.authMiddleware, auth_1.operatorOnly, (0, validation_1.validateMiddleware)(hotel_1.hotelSchema), updateHotel);
router.delete('/:id([0-9]{1,})', auth_1.authMiddleware, auth_1.operatorOnly, deleteHotel);
