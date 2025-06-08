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
exports.deleteById = exports.update = exports.findByUsername = exports.add = exports.getByUserId = exports.getSearch = exports.getAll = void 0;
const db = __importStar(require("../helpers/database"));
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, page = 1) {
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM users LIMIT  ? OFFSET  ?;";
    const data = yield db.run_query(query, [limit, offset]);
    return data;
});
exports.getAll = getAll;
const getSearch = (sfield, q) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT ${sfield} FROM users WHERE ${sfield} LIKE '%${q}%' `;
    try {
        const data = yield db.run_query(query, null);
        return data;
    }
    catch (error) {
        return error;
    }
});
exports.getSearch = getSearch;
const getByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let query = "SELECT * FROM users WHERE id = ?";
    let values = [id];
    let data = yield db.run_query(query, values);
    return data;
});
exports.getByUserId = getByUserId;
const add = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let keys = Object.keys(user);
    let values = Object.values(user);
    let key = keys.join(',');
    let parm = '';
    for (let i = 0; i < values.length; i++) {
        parm += '?,';
    }
    parm = parm.slice(0, -1);
    let query = `INSERT INTO users (${key}) VALUES (${parm})`;
    try {
        yield db.run_query(query, values);
        return { "status": 201 };
    }
    catch (error) {
        return error;
    }
});
exports.add = add;
const findByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM users where username = ?';
    const user = yield db.run_query(query, [username]);
    return user;
});
exports.findByUsername = findByUsername;
const update = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log("user " , user)
    // console.log("id ",id)
    let keys = Object.keys(user);
    let values = Object.values(user);
    let updateString = "";
    for (let i = 0; i < values.length; i++) {
        updateString += keys[i] + "=" + "'" + values[i] + "'" + ",";
    }
    updateString = updateString.slice(0, -1);
    // console.log("updateString ", updateString)
    let query = `UPDATE users SET ${updateString} WHERE ID=${id} RETURNING *;`;
    try {
        yield db.run_query(query, values);
        return { "status": 201 };
    }
    catch (error) {
        return error;
    }
});
exports.update = update;
const deleteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let query = "Delete FROM users WHERE ID = ?";
    let values = [id];
    try {
        yield db.run_query(query, values);
        return { "affectedRows": 1 };
    }
    catch (error) {
        return error;
    }
});
exports.deleteById = deleteById;
