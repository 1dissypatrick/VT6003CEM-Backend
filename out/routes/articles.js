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
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const model = __importStar(require("../models/articles"));
const likes = __importStar(require("../models/likes"));
const favs = __importStar(require("../models/favs"));
const msgs = __importStar(require("../models/msgs"));
const validation_1 = require("../controllers/validation");
const auth_1 = require("../controllers/auth");
const router = new koa_router_1.default({ prefix: '/api/v1/articles' });
exports.router = router;
const getAll = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    //ctx.body = articles;
    const { limit = 100, page = 1, order = "dateCreated", direction = 'ASC' } = ctx.request.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const result = yield model.getAll(20, 1, order, direction);
    if (result.length) {
        const body = result.map((post) => {
            const { id = 0, title = "", alltext = "", summary = "", imageurl = "", authorid = 0, description = "" } = post;
            const links = {
                likes: `http://${ctx.host}/api/v1/articles/${post.id}/likes`,
                fav: `http://${ctx.host}/api/v1/articles/${post.id}/fav`,
                msg: `http://${ctx.host}/api/v1/articles/${post.id}/msg`,
                self: `http://${ctx.host}/api/v1/articles/${post.id}`
            };
            return { id, title, alltext, summary, imageurl, authorid, description, links }; // Utilizing the destructured elements
        });
        ctx.body = body;
        yield next();
    }
});
const createArticle = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = ctx.request.body;
    console.log(`role of user ${ctx.state.user.user.role}`);
    if (ctx.state.user.user.role === 'admin') {
        let result = yield model.add(body);
        if (result.status == 201) {
            ctx.status = 201;
            ctx.body = body;
        }
        else {
            ctx.status = 500;
            ctx.body = { err: "Insert data failed" };
        }
    }
    else {
        ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
        ctx.status = 401;
    }
});
const getById = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = +ctx.params.id;
    let article = yield model.getById(id);
    if (article.length) {
        ctx.body = article[0];
        ctx.status = 200;
    }
    else {
        ctx.status = 404;
    }
    yield next();
});
const updateArticle = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = +ctx.params.id;
    if (ctx.state.user.user.role === 'admin') {
        let c = ctx.request.body;
        console.log('authorid ' + c.authorid);
        if (c.authorid == ctx.state.user.user.id) {
            let result = yield model.update(c, id);
            if (result) {
                ctx.status = 201;
                ctx.body = `Article with id ${id} updated`;
            }
            yield next();
        }
        else {
            ctx.body = { message: 'You are not the author and you have no right to update this article' };
            ctx.status = 401;
        }
    }
    else {
        ctx.body = { msg: ' you are not authorized' };
        ctx.status = 401;
    }
});
const deleteArticle = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = +ctx.params.id;
    if (ctx.state.user.user.role === 'admin') {
        let article = yield model.deleteById(id);
        ctx.status = 201;
        ctx.body = article.affectedRows ? { message: "removed" } : { message: "error" };
        yield next();
    }
    else {
        ctx.body = { msg: ' you are not authorized' };
        ctx.status = 401;
    }
});
// methods for like icon
function likesCount(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const id = ctx.params.id;
        const result = yield likes.count(id);
        ctx.body = result ? result : 0;
        yield next();
    });
}
function likePost(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const user = ctx.state.user;
        const uid = user.user.id;
        const id = parseInt(ctx.params.id);
        const result = yield likes.like(id, uid);
        ctx.body = result.affectedRows ? { message: "liked", userid: result.userid } : { message: "error" };
        yield next();
    });
}
function dislikePost(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const user = ctx.state.user;
        const uid = user.user.id;
        const id = parseInt(ctx.params.id);
        const result = yield likes.dislike(id, uid);
        ctx.body = result.affectedRows ? { message: "disliked" } : { message: "error" };
        yield next();
    });
}
//mehtods for Heart(Favorite) icon
function userFav(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const user = ctx.state.user;
        const uid = user.user.id;
        const result = yield favs.listFav(uid);
        ctx.body = result ? result : 0;
        yield next();
    });
}
function postFav(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const user = ctx.state.user;
        const uid = user.user.id;
        const id = parseInt(ctx.params.id);
        const result = yield favs.addFav(id, uid);
        ctx.body = result.affectedRows ? { message: "added", userid: result.userid } : { message: "error" };
        yield next();
    });
}
function rmFav(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // For you TODO: add error handling and error response code
        const user = ctx.state.user;
        const uid = user.user.id;
        const id = parseInt(ctx.params.id);
        const result = yield favs.removeFav(id, uid);
        ctx.body = result.affectedRows ? { message: "removed" } : { message: "error" };
        yield next();
    });
}
//methods for message icon
function listMsg(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = parseInt(ctx.params.id);
        const result = yield msgs.getMsg(id);
        ctx.body = result ? result : 0;
        yield next();
    });
}
function addMsg(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = parseInt(ctx.params.id);
        const user = ctx.state.user;
        const uid = user.user.id;
        const uname = user.user.username;
        const uemail = user.user.email;
        let msg = ctx.request.body;
        console.log('ctx.request.body ', ctx.request.body);
        console.log('..msg ', msg);
        const result = yield msgs.add_Msg(id, uid, uname, uemail, msg);
        ctx.body = result.affectedRows ? { message: "added" } : { message: "error" };
        yield next();
    });
}
function rmMsg(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const uid = ctx.state.user.id;
        // only admin can del article comment
        if (ctx.state.user.user.role === 'admin') {
            let b = ctx.request.body;
            const id = parseInt(ctx.params.id);
            const result = yield msgs.removeMsg(id, b);
            ctx.body = result.affectedRows ? { message: "removed" } : { message: "error" };
            yield next();
        }
        else {
            ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized to delete user comment` };
            ctx.status = 401;
        }
    });
}
router.get('/', getAll);
router.post('/', auth_1.basicAuth, (0, koa_bodyparser_1.default)(), validation_1.validateArticle, createArticle);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', auth_1.basicAuth, (0, koa_bodyparser_1.default)(), validation_1.validateArticle, updateArticle);
router.delete('/:id([0-9]{1,})', auth_1.basicAuth, deleteArticle);
router.get('/:id([0-9]{1,})/likes', likesCount);
router.post('/:id([0-9]{1,})/likes', auth_1.basicAuth, likePost);
router.del('/:id([0-9]{1,})/likes', auth_1.basicAuth, dislikePost);
router.get('/fav', auth_1.basicAuth, userFav);
router.post('/:id([0-9]{1,})/fav', auth_1.basicAuth, postFav);
router.del('/:id([0-9]{1,})/fav', auth_1.basicAuth, rmFav);
router.get('/:id([0-9]{1,})/msg', listMsg);
router.post('/:id([0-9]{1,})/msg', auth_1.basicAuth, (0, koa_bodyparser_1.default)(), addMsg);
router.del('/:id([0-9]{1,})/msg', auth_1.basicAuth, (0, koa_bodyparser_1.default)(), rmMsg);
