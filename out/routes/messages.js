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
const message_schema_1 = require("../schema/message.schema");
const model = __importStar(require("../models/messages"));
const prefix = '/api/v1/messages';
const router = new koa_router_1.default({ prefix });
exports.router = router;
/**
 * Send a new message to an operator.
 */
const sendMessage = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: senderId } = ctx.state.user; // Changed from senderId to id
    const { recipientId, hotelId, content } = ctx.request.body;
    console.log('sendMessage: Sending message from senderId=', senderId, 'to recipientId=', recipientId, 'hotelId=', hotelId, 'user=', ctx.state.user);
    try {
        const message = yield model.add(senderId, recipientId, hotelId || null, content);
        ctx.status = 201;
        ctx.body = message;
    }
    catch (error) {
        console.error('sendMessage: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
/**
 * Get all messages for the authenticated user.
 */
const getMessages = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = ctx.state.user;
    console.log('getMessages: Retrieving messages for userId=', userId);
    try {
        const messages = yield model.getByUserId(userId);
        ctx.status = 200;
        ctx.body = messages;
    }
    catch (error) {
        console.error('getMessages: Error:', error);
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
    yield next();
});
/**
 * Respond to a message (operator only).
 */
const respondMessage = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: operatorId, role } = ctx.state.user;
    const messageId = parseInt(ctx.params.messageId, 10);
    const { response } = ctx.request.body;
    console.log('respondMessage: OperatorId=', operatorId, 'responding to messageId=', messageId);
    if (role !== 'operator') {
        ctx.status = 403;
        ctx.body = { error: 'Only operators can respond to messages' };
        return;
    }
    if (isNaN(messageId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid message ID' };
        return;
    }
    try {
        const updatedMessage = yield model.respond(messageId, response, operatorId);
        ctx.status = 200;
        ctx.body = updatedMessage;
    }
    catch (error) {
        console.error('respondMessage: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
/**
 * Delete a message (operator only).
 */
const deleteMessage = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: operatorId, role } = ctx.state.user;
    const messageId = parseInt(ctx.params.messageId, 10);
    console.log('deleteMessage: OperatorId=', operatorId, 'deleting messageId=', messageId);
    if (role !== 'operator') {
        ctx.status = 403;
        ctx.body = { error: 'Only operators can delete messages' };
        return;
    }
    if (isNaN(messageId)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid message ID' };
        return;
    }
    try {
        const result = yield model.remove(messageId, operatorId);
        if (result.rowsAffected === 0) {
            ctx.status = 404;
            ctx.body = { error: 'Message not found or unauthorized' };
        }
        else {
            ctx.status = 200;
            ctx.body = { message: 'Message deleted successfully' };
        }
    }
    catch (error) {
        console.error('deleteMessage: Error:', error);
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
    yield next();
});
router.post('/', auth_1.authMiddleware, (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(message_schema_1.messageCreateSchema), sendMessage);
router.get('/', auth_1.authMiddleware, getMessages);
router.patch('/:messageId([0-9]{1,})', auth_1.authMiddleware, (0, koa_bodyparser_1.default)(), (0, validation_1.validateMiddleware)(message_schema_1.messageRespondSchema), respondMessage);
router.delete('/:messageId([0-9]{1,})', auth_1.authMiddleware, deleteMessage);
