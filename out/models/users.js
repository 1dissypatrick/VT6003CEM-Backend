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
exports.deleteById = exports.update = exports.add = exports.getByEmail = exports.findByUsername = exports.getByUserId = exports.getSearch = exports.getAll = void 0;
const db = __importStar(require("../helpers/database"));
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 20, page = 1) {
    const offset = (page - 1) * limit;
    const query = 'SELECT id, username, email, role, avatarurl FROM users LIMIT :limit OFFSET :offset';
    const results = yield db.run_query(query, { limit: limit.toString(), offset: offset.toString() });
    return results !== null && results !== void 0 ? results : [];
});
exports.getAll = getAll;
const getSearch = (fields, search) => __awaiter(void 0, void 0, void 0, function* () {
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    const validFields = fieldArray.filter((f) => ['username', 'email', 'role'].includes(f));
    if (!validFields.length)
        return [];
    const conditions = validFields.map((f) => `${f} ILIKE :search`).join(' OR ');
    const query = `SELECT id, username, email, role, avatarurl FROM users WHERE ${conditions}`;
    const results = yield db.run_query(query, { search: `%${search}%` });
    return results !== null && results !== void 0 ? results : [];
});
exports.getSearch = getSearch;
const getByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, username, email, role, avatarurl FROM users WHERE id = :id';
    const results = yield db.run_query(query, { id: id.toString() });
    return results.length > 0 ? results[0] : null;
});
exports.getByUserId = getByUserId;
const findByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, username, password, email, role, avatarurl FROM users WHERE username = :username';
    const result = yield db.run_query(query, { username });
    return Array.isArray(result) ? result : [result].filter(Boolean);
});
exports.findByUsername = findByUsername;
const getByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, username, password, email, role, avatarurl FROM users WHERE email = :email';
    const results = yield db.run_query(query, { email });
    return results !== null && results !== void 0 ? results : [];
});
exports.getByEmail = getByEmail;
const add = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email, role, avatarurl, signupCode } = user;
    console.log('Received signupCode:', signupCode);
    if (!username || !password || !email || !role) {
        throw new Error('Missing required fields');
    }
    const existingUsers = yield (0, exports.findByUsername)(username);
    const existingEmails = yield (0, exports.getByEmail)(email);
    if (existingUsers.length > 0 || existingEmails.length > 0) {
        throw new Error('User already exists');
    }
    console.log('Using provided hash for', username, ':', password);
    const query = 'INSERT INTO users (username, password, email, role, avatarurl, signupcode) VALUES (:username, :password, :email, :role, :avatarurl, :signupcode) RETURNING id';
    try {
        const result = yield db.run_insert(query, {
            username,
            password: password || '',
            email,
            role,
            avatarurl: avatarurl || null,
            signupcode: signupCode || null,
        });
        console.log('User inserted with ID:', result.id);
        return result.id;
    }
    catch (error) {
        console.error('Insert error:', error);
        throw new Error(`Failed to add user: ${error.message}`);
    }
});
exports.add = add;
const update = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(user).filter((k) => k !== 'id');
    if (keys.length === 0)
        return { status: 400 };
    const setClause = keys.map((key) => `${key} = :${key}`).join(', ');
    const values = keys.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: user[key] })), { id: id.toString() });
    const query = `UPDATE users SET ${setClause} WHERE id = :id`;
    try {
        yield db.run_update(query, values);
        return { status: 201 };
    }
    catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
});
exports.update = update;
const deleteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM users WHERE id = :id';
    try {
        const result = yield db.run_delete(query, { id: id.toString() });
        return { affectedRows: result.rowsAffected };
    }
    catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
});
exports.deleteById = deleteById;
