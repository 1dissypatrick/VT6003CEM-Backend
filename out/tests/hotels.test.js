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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const database_1 = require("../helpers/database");
const hotelModel = __importStar(require("../models/hotels"));
const userModel = __importStar(require("../models/users"));
const index_1 = __importDefault(require("../index"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request = (0, supertest_1.default)(index_1.default.callback());
const JWT_SECRET = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';
describe('Hotel API', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield database_1.sequelize.authenticate();
        yield database_1.sequelize.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), role VARCHAR(50), avatarurl VARCHAR(255))');
        yield database_1.sequelize.query('CREATE TABLE IF NOT EXISTS hotels (id SERIAL PRIMARY KEY, name VARCHAR(255), location VARCHAR(255), price FLOAT, availability BOOLEAN, description TEXT, rating FLOAT)');
        yield userModel.add({
            username: 'testoperator',
            password: yield Promise.resolve().then(() => __importStar(require('bcrypt'))).then((bcrypt) => bcrypt.hashSync('password123', 10)),
            email: 'test@operator.com',
            role: 'operator',
            avatarurl: '',
            signupCode: 'WANDERLUST2025',
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield database_1.sequelize.query('DROP TABLE IF EXISTS hotels');
        yield database_1.sequelize.query('DROP TABLE IF EXISTS users');
        yield database_1.sequelize.close();
    }));
    it('should list hotels without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
        yield hotelModel.add({ name: 'Test Hotel', location: 'Paris', price: 100, availability: true });
        const res = yield request.get('/api/v1/hotels');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Test Hotel');
        expect(res.body[0].availability).toBe(true);
    }));
    it('should create a hotel with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = jsonwebtoken_1.default.sign({ username: 'testoperator', role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
        const res = yield request
            .post('/api/v1/hotels')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'New Hotel', location: 'London', price: 150, availability: true });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    }));
    it('should not create a hotel without token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/api/v1/hotels')
            .send({ name: 'New Hotel', location: 'London', price: 150, availability: true });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid token');
    }));
    it('should not create a hotel with invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = jsonwebtoken_1.default.sign({ username: 'testoperator', role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
        const res = yield request
            .post('/api/v1/hotels')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: '', location: 'London', price: -10, availability: true });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    }));
});
