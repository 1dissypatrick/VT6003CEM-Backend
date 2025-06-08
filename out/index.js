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
const koa_router_1 = __importDefault(require("koa-router"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_passport_1 = __importDefault(require("koa-passport"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const cors_1 = __importDefault(require("@koa/cors"));
const articles_1 = require("./routes/articles");
const special_1 = require("./routes/special");
const uploads_1 = require("./routes/uploads");
const users_1 = require("./routes/users");
const koa_static_1 = __importDefault(require("koa-static"));
const app = new koa_1.default();
const router = new koa_router_1.default();
/*const welcomeAPI = async (ctx: RouterContext, next:any) => {
  ctx.body = {message: "Welcome to the blog API!"};
  await next();
}

router.get('/api/v1', welcomeAPI);
*/
// For Document:
app.use((0, koa_static_1.default)('./docs'));
app.use((0, cors_1.default)());
app.use((0, koa_logger_1.default)());
app.use((0, koa_json_1.default)());
app.use((0, koa_bodyparser_1.default)());
app.use(router.routes());
app.use(koa_passport_1.default.initialize());
app.use(articles_1.router.middleware());
app.use(special_1.router.middleware());
app.use(uploads_1.router.middleware());
app.use(users_1.router.middleware());
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
        console.log(ctx.status);
        if (ctx.status === 404) {
            ctx.body = { err: "No such endpoint existed" };
        }
    }
    catch (err) {
        ctx.body = { err: err };
    }
}));
let port = process.env.PORT || 10888;
app.listen(10888, () => {
    console.log(`Koa Started at ${port}`);
});
