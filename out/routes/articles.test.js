"use strict";
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
const koa_1 = __importDefault(require("koa"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_passport_1 = __importDefault(require("koa-passport"));
const articles_1 = require("../routes/articles");
const supertest_1 = __importDefault(require("supertest"));
const app = new koa_1.default();
app.use((0, koa_json_1.default)());
app.use(koa_passport_1.default.initialize());
app.use(articles_1.router.middleware());
app.listen(3000);
describe('a simple api endpoint', () => {
    test('Get all article', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, supertest_1.default)(app.callback()).get('/api/v1/articles');
        expect(result.statusCode).toEqual(200);
    }));
    test('Post an article', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, supertest_1.default)(app.callback()).post('/api/v1/articles')
            .set("Authorization", "Basic Ym9iOjY1NDMyMQ==")
            .send({
            "title": "It's Supertest",
            "allText": "Learning testing stuff ",
            "authorID": 5
        });
        expect(result.statusCode).toEqual(201);
    }));
});
