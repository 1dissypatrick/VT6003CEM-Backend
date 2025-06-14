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
exports.deleteById = exports.update = exports.add = exports.getById = exports.getAll = void 0;
const db = __importStar(require("../helpers/database"));
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, page = 1, search = '', location = '', minPrice, maxPrice) {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy FROM hotels WHERE id IS NOT NULL';
    const values = {};
    if (search) {
        query += ` AND name ILIKE :search`;
        values.search = `%${search}%`;
    }
    if (location) {
        query += ` AND location ILIKE :location`;
        values.location = `%${location}%`;
    }
    if (minPrice !== undefined) {
        query += ` AND price >= :minPrice`;
        values.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
        query += ` AND price <= :maxPrice`;
        values.maxPrice = maxPrice;
    }
    query += ` LIMIT :limit OFFSET :offset`;
    values.limit = limit;
    values.offset = offset;
    const results = yield db.run_query(query, values);
    console.log('getAll model: Database results:', results);
    return results !== null && results !== void 0 ? results : [];
});
exports.getAll = getAll;
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy FROM hotels WHERE id = :id';
    const results = yield db.run_query(query, { id });
    console.log('getById model: Database results for id=', id, ':', results);
    return results.length > 0 ? results[0] : null;
});
exports.getById = getById;
const add = (hotel) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location, price, availability, amenities, imageUrl, description, rating, createdBy } = hotel;
    const query = 'INSERT INTO hotels (name, location, price, availability, amenities, image_url, description, rating, created_by) ' +
        'VALUES (:name, :location, :price, :availability::jsonb, :amenities::jsonb, :imageUrl, :description, :rating, :createdBy) RETURNING id';
    try {
        const result = yield db.run_insert(query, {
            name,
            location,
            price,
            availability: JSON.stringify(availability),
            amenities: JSON.stringify(amenities),
            imageUrl: imageUrl || null,
            description: description || null,
            rating: rating || null,
            createdBy,
        });
        console.log('add model: Inserted hotel id=', result.id);
        return { status: 201, data: result.id };
    }
    catch (error) {
        console.error('add model: Error:', error);
        throw new Error(`Failed to add hotel: ${error.message}`);
    }
});
exports.add = add;
const update = (hotel, id) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(hotel).filter((k) => k !== 'id');
    if (keys.length === 0) {
        return { status: 400, data: {} };
    }
    const keyMap = {
        imageUrl: 'image_url',
        createdBy: 'created_by',
    };
    const setClause = keys
        .map((key) => {
        const dbKey = keyMap[key] || key;
        return key === 'availability' || key === 'amenities'
            ? `${dbKey} = :${key}::jsonb`
            : `${dbKey} = :${key}`;
    })
        .join(', ');
    const values = keys.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: key === 'availability' || key === 'amenities' ? JSON.stringify(hotel[key]) : hotel[key] })), { id });
    const query = `UPDATE hotels SET ${setClause} WHERE id = :id RETURNING id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy`;
    try {
        const result = yield db.run_update(query, values);
        console.log('update model: Updated hotel id=', id, 'result:', result);
        return result.length > 0 ? { status: 200, data: result[0] } : { status: 404, data: {} };
    }
    catch (error) {
        console.error('update model: Error:', error);
        throw new Error(`Failed to update hotel: ${error.message}`);
    }
});
exports.update = update;
const deleteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM hotels WHERE id = :id';
    try {
        const result = yield db.run_delete(query, { id });
        console.log('deleteById model: Deleted hotel id=', id, 'rowsAffected:', result.rowsAffected);
        return result.rowsAffected > 0 ? { status: 200 } : { status: 404 };
    }
    catch (error) {
        console.error('deleteById model: Error:', error);
        throw new Error(`Failed to delete hotel: ${error.message}`);
    }
});
exports.deleteById = deleteById;
