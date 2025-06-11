"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(255),
    password: joi_1.default.string().min(8).max(255),
    email: joi_1.default.string().email(),
    role: joi_1.default.string().valid('user', 'operator'),
    avatarurl: joi_1.default.string().uri().allow('', null).max(255), // Allow null
    signupCode: joi_1.default.string().allow('', null), // Allow null
}).min(1); // Require at least one field for partial updates
