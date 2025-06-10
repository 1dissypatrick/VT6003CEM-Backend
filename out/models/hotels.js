"use strict";
// import * as db from '../helpers/database';
// import { Hotel } from '../schema/hotel';
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
exports.deleteById = exports.update = exports.add = exports.getById = exports.getAll = void 0;
// /**
//  * Get all hotels with optional search and filters.
//  */
// export const getAll = async (
//   limit = 10,
//   page = 1,
//   search = '',
//   location = '',
//   minPrice?: number,
//   maxPrice?: number
// ): Promise<Hotel[]> => {
//   const offset = (page - 1) * limit;
//   let query = 'SELECT id, name, description, location, price, rating FROM hotels WHERE 1=1';
//   const values: any[] = [];
//   if (search) {
//     query += ' AND name ILIKE ?';
//     values.push(`%${search}%`);
//   }
//   if (location) {
//     query += ' AND location ILIKE ?';
//     values.push(`%${location}%`);
//   }
//   if (minPrice !== undefined) {
//     query += ' AND price >= ?';
//     values.push(minPrice);
//   }
//   if (maxPrice !== undefined) {
//     query += ' AND price <= ?';
//     values.push(maxPrice);
//   }
//   query += ' LIMIT ? OFFSET ?';
//   values.push(limit, offset);
//   return await db.run_query<Hotel>(query, values);
// };
// /**
//  * Get a hotel by ID.
//  */
// export const getById = async (id: number): Promise<Hotel | null> => {
//   const query = 'SELECT id, name, description, location, price, rating FROM hotels WHERE id = ?';
//   const results = await db.run_query<Hotel>(query, [id]);
//   return results.length > 0 ? results[0] : null;
// };
// /**
//  * Add a new hotel.
//  */
// export const add = async (hotel: Omit<Hotel, 'id'>): Promise<{ status: number; data: number }> => {
//   const { name, description, location, price, rating } = hotel;
//   const query =
//     'INSERT INTO hotels (name, description, location, price, rating) VALUES (?, ?, ?, ?, ?) RETURNING id';
//   const result = await db.run_insert<{ id: number }>(query, [name, description, location, price, rating || null]);
//   return { status: 201, data: result.id };
// };
// /**
//  * Update a hotel by ID.
//  */
// export const update = async (hotel: Partial<Hotel>, id: number): Promise<{ status: number; data: Hotel }> => {
//   const keys = Object.keys(hotel) as (keyof Hotel)[];
//   const values = Object.values(hotel);
//   const updateString = keys.map((key, index) => `${key}=$${index + 1}`).join(', ');
//   const query = `UPDATE hotels SET ${updateString} WHERE id=$${keys.length + 1} RETURNING *`;
//   values.push(id);
//   try {
//     const result = await db.run_update<Hotel>(query, values);
//     return { status: 200, data: result[0] };
//   } catch (error) {
//     return { status: 404, data: {} as Hotel };
//   }
// };
// /**
//  * Delete a hotel by ID.
//  */
// export const deleteById = async (id: number): Promise<{ status: number }> => {
//   const query = 'DELETE FROM hotels WHERE id = ?';
//   try {
//     await db.run_delete(query, [id]);
//     return { status: 200 };
//   } catch (error) {
//     return { status: 404 };
//   }
// };
const db = __importStar(require("../helpers/database"));
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, page = 1, search = '', location = '', minPrice, maxPrice) {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, location, price, availability, description, rating FROM hotels WHERE 1=1';
    const values = [];
    let paramIndex = 1;
    if (search) {
        query += ` AND name ILIKE $${paramIndex++}`;
        values.push(`%${search}%`);
    }
    if (location) {
        query += ` AND location ILIKE $${paramIndex++}`;
        values.push(`%${location}%`);
    }
    if (minPrice !== undefined) {
        query += ` AND price >= $${paramIndex++}`;
        values.push(minPrice);
    }
    if (maxPrice !== undefined) {
        query += ` AND price <= $${paramIndex++}`;
        values.push(maxPrice);
    }
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);
    return yield db.run_query(query, values);
});
exports.getAll = getAll;
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, name, location, price, availability, description, rating FROM hotels WHERE id = $1';
    const results = yield db.run_query(query, [id]);
    return results.length > 0 ? results[0] : null;
});
exports.getById = getById;
const add = (hotel) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location, price, availability, description, rating } = hotel;
    const query = 'INSERT INTO hotels (name, location, price, availability, description, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
    try {
        const result = yield db.run_insert(query, [
            name,
            location,
            price,
            availability,
            description || null,
            rating || null,
        ]);
        return { status: 201, data: result.id };
    }
    catch (error) {
        throw new Error(`Failed to add hotel: ${error.message}`);
    }
});
exports.add = add;
const update = (hotel, id) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(hotel).filter((k) => k !== 'id');
    if (keys.length === 0) {
        return { status: 400, data: {} };
    }
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE hotels SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const values = [...Object.values(hotel), id];
    try {
        const result = yield db.run_update(query, values);
        return result.length > 0 ? { status: 200, data: result[0] } : { status: 404, data: {} };
    }
    catch (error) {
        throw new Error(`Failed to update hotel: ${error.message}`);
    }
});
exports.update = update;
const deleteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM hotels WHERE id = $1';
    try {
        yield db.run_delete(query, [id]);
        return { status: 200 };
    }
    catch (error) {
        throw new Error(`Failed to delete hotel: ${error.message}`);
    }
});
exports.deleteById = deleteById;
