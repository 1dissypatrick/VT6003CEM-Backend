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
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_1 = require("../controllers/auth");
const router = new koa_router_1.default({ prefix: '/api/v1' });
exports.router = router;
// Just for testing
router.get('/', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = {
        message: 'Public API return'
    };
    yield next();
}));
router.get("/private", auth_1.basicAuth, privateAPI);
// Add a protected route that requires authentication
function privateAPI(ctx, next) {
    const user = ctx.state.user;
    //  console.log('user=> '+JSON.stringify(user))
    //  console.log('status=> '+ctx.status)
    ctx.body = { message: `Hello ${user.user.username} you registered on ${user.user.dateregistered}` };
}
