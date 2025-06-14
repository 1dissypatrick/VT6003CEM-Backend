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
require("dotenv/config");
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const cors_1 = __importDefault(require("@koa/cors"));
const users_1 = require("./routes/users");
const hotels_1 = require("./routes/hotels");
const favorites_1 = require("./routes/favorites");
const messages_1 = require("./routes/messages"); // Add this
const koa_static_1 = __importDefault(require("koa-static"));
const app = new koa_1.default();
const router = new koa_router_1.default();
app.use((0, koa_logger_1.default)());
app.use((0, koa_json_1.default)());
app.use((0, koa_bodyparser_1.default)());
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use((0, koa_static_1.default)('./docs'));
app.use(users_1.router.routes()).use(users_1.router.allowedMethods());
app.use(hotels_1.router.routes()).use(hotels_1.router.allowedMethods());
app.use(favorites_1.router.routes()).use(favorites_1.router.allowedMethods());
app.use(messages_1.router.routes()).use(messages_1.router.allowedMethods()); // Add this
app.use(router.routes()).use(router.allowedMethods());
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
        if (ctx.status === 404 && !ctx.body) {
            ctx.body = { error: 'Not found' };
        }
    }
    catch (err) {
        console.error('Error:', err);
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}));
const port = process.env.PORT || 10888;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;
