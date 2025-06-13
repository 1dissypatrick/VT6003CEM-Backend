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
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.getByUserId = exports.add = void 0;
const db = __importStar(require("../helpers/database"));
const add = (userId, hotelId) => __awaiter(void 0, void 0, void 0, function* () {
    const hotelQuery = 'SELECT id, name FROM hotels WHERE id = :hotelId';
    const hotels = yield db.run_query(hotelQuery, { hotelId: hotelId.toString() });
    if (!hotels.length) {
        throw new Error('Hotel not found');
    }
    const hotelName = hotels[0].name;
    const existingQuery = 'SELECT id FROM favorites WHERE user_id = :userId AND hotel_id = :hotelId';
    const existing = yield db.run_query(existingQuery, { userId: userId.toString(), hotelId: hotelId.toString() });
    if (existing.length) {
        throw new Error('Hotel already favorited');
    }
    const query = 'INSERT INTO favorites (user_id, hotel_id, hotel_name) VALUES (:userId, :hotelId, :hotelName) ' +
        'RETURNING id, user_id AS "userId", hotel_id AS "hotelId", hotel_name AS "hotelName", created_at AS "createdAt"';
    try {
        const result = yield db.run_insert(query, {
            userId: userId.toString(),
            hotelId: hotelId.toString(),
            hotelName,
        });
        console.log('add: Inserted favorite:', result);
        return result;
    }
    catch (error) {
        console.error('add: Error:', error);
        throw new Error(`Failed to add favorite: ${error.message}`);
    }
});
exports.add = add;
const getByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, user_id AS "userId", hotel_id AS "hotelId", hotel_name AS "hotelName", created_at AS "createdAt" ' +
        'FROM favorites WHERE user_id = :userId ORDER BY created_at DESC';
    try {
        const results = yield db.run_query(query, { userId: userId.toString() });
        console.log('getByUserId: Retrieved favorites for userId=', userId, ':', results);
        return results !== null && results !== void 0 ? results : [];
    }
    catch (error) {
        console.error('getByUserId: Error:', error);
        throw new Error(`Failed to retrieve favorites: ${error.message}`);
    }
});
exports.getByUserId = getByUserId;
const remove = (userId, hotelId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM favorites WHERE user_id = :userId AND hotel_id = :hotelId';
    try {
        const result = yield db.run_delete(query, { userId: userId.toString(), hotelId: hotelId.toString() });
        console.log('remove: Deleted favorite for userId=', userId, 'hotelId=', hotelId, 'rowsAffected:', result.rowsAffected);
        return result;
    }
    catch (error) {
        console.error('remove: Error:', error);
        throw new Error(`Failed to remove favorite: ${error.message}`);
    }
});
exports.remove = remove;
