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
exports.deleteById = exports.update = exports.add = exports.getAll = exports.getById = void 0;
const db = __importStar(require("../helpers/database"));
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'SELECT * FROM articles WHERE ID = ?';
    let values = [id];
    let data = yield db.run_query(query, values);
    return data;
});
exports.getById = getById;
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, page = 1, order, direction) {
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM articles LIMIT  ? OFFSET  ?;";
    const data = yield db.run_query(query, [limit, offset]);
    return data;
});
exports.getAll = getAll;
const add = (article) => __awaiter(void 0, void 0, void 0, function* () {
    let keys = Object.keys(article);
    let values = Object.values(article);
    let key = keys.join(',');
    let param = '';
    for (let i = 0; i < values.length; i++) {
        param += '? ,';
    }
    param = param.slice(0, -1);
    let query = `INSERT INTO articles (${key}) VALUES (${param})`;
    try {
        yield db.run_insert(query, values);
        return { status: 201 };
    }
    catch (err) {
        return err;
    }
});
exports.add = add;
const update = (article, id) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log("article " , article)
    // console.log("id ",id)
    let keys = Object.keys(article);
    let values = Object.values(article);
    let updateString = "";
    for (let i = 0; i < values.length; i++) {
        updateString += keys[i] + "=" + "'" + values[i] + "'" + ",";
    }
    updateString = updateString.slice(0, -1);
    // console.log("updateString ", updateString)
    let query = `UPDATE articles SET ${updateString} WHERE ID=${id} RETURNING *;`;
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
    let query = "Delete FROM articles WHERE ID = ?";
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
