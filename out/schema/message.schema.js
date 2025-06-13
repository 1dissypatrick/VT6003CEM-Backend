"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRespondSchema = exports.messageCreateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.messageCreateSchema = joi_1.default.object({
    recipientId: joi_1.default.number().integer().positive().required(),
    hotelId: joi_1.default.number().integer().positive().optional(),
    content: joi_1.default.string().trim().min(1).max(1000).required(),
}).options({ stripUnknown: true });
exports.messageRespondSchema = joi_1.default.object({
    response: joi_1.default.string().trim().min(1).max(1000).required(),
}).options({ stripUnknown: true });
