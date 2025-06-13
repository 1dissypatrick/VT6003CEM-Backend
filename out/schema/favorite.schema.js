"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.favoriteSchema = joi_1.default.object({
    hotelId: joi_1.default.number().integer().positive().required(),
}).options({ stripUnknown: true });
