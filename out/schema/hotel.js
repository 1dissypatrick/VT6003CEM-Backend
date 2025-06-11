"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelSchema = void 0;
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
    imageUrl: joi_1.default.alternatives()
        .try(joi_1.default.string().uri().allow('').optional(), // Accept imageUrl
    joi_1.default.object({
        image_url: joi_1.default.string().uri().allow('').optional(), // Accept image_url
    }).unknown(true))
        .optional(),
    description: joi_1.default.string().allow(''),
    rating: joi_1.default.number().min(0).max(5),
    createdBy: joi_1.default.number().min(1).optional(), // Allow server to set createdBy
}).min(1).custom((value, helpers) => {
    // Normalize image_url to imageUrl
    if (value.image_url && !value.imageUrl) {
        value.imageUrl = value.image_url;
        delete value.image_url;
    }
    else if (value.imageUrl && typeof value.imageUrl === 'object' && 'image_url' in value.imageUrl) {
        value.imageUrl = value.imageUrl.image_url;
    }
    return value;
}); // Allow partial updates for PUT
