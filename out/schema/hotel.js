"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelSchema = void 0;
// src/schema/hotel.ts
const joi_1 = __importDefault(require("joi"));
exports.hotelSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).required(),
    location: joi_1.default.string().min(1).required(),
    price: joi_1.default.number().min(0).required(),
    availability: joi_1.default.array()
        .items(joi_1.default.object({
        date: joi_1.default.string().isoDate().required(),
        roomsAvailable: joi_1.default.number().min(0).required(),
    }))
        .required(),
    amenities: joi_1.default.array().items(joi_1.default.string()).required(),
    imageUrl: joi_1.default.string().uri().allow(''),
    description: joi_1.default.string().allow(''),
    rating: joi_1.default.number().min(0).max(5),
    createdBy: joi_1.default.number().min(1).required(),
}).min(1); // Allow partial updates for PUT
