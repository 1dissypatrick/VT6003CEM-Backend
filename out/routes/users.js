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
const auth_1 = require("../controllers/auth");
const validation_1 = require("../controllers/validation");
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const model = __importStar(require("../models/users"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prefix = '/api/v1/users';
const router = new koa_router_1.default({ prefix: prefix });
exports.router = router;
const getAll = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let users = yield model.getAll(20, 1);
    if (users.length) {
        ctx.body = users;
    }
    else {
        ctx.body = {};
    }
    yield next();
});
const doSearch = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { limit = 50, page = 1, fields = "", q = "" } = ctx.request.query;
    // ensure params are integers
    limit = parseInt(limit);
    page = parseInt(page);
    // validate values to ensure they are sensible
    limit = limit > 200 ? 200 : limit;
    limit = limit < 1 ? 10 : limit;
    page = page < 1 ? 1 : page;
    let result;
    // search by single field and field contents
    // need to validate q input
    if (ctx.state.user.user.role === 'admin') {
        try {
            if (q !== "")
                result = yield model.getSearch(fields, q);
            else {
                console.log('get all');
                result = yield model.getAll(limit, page);
                console.log(result);
            }
            if (result.length) {
                if (fields !== "") {
                    // first ensure the fields are contained in an array
                    // need this since a single field in the query is passed as a string
                    console.log('fields' + fields);
                    if (!Array.isArray(fields)) {
                        fields = [fields];
                    }
                    // then filter each row in the array of results
                    // by only including the specified fields
                    result = result.map((record) => {
                        let partial = {};
                        for (let field of fields) {
                            partial[field] = record[field];
                        }
                        return partial;
                    });
                }
                console.log(result);
                ctx.body = result;
            }
        }
        catch (error) {
            return error;
        }
        yield next();
    }
    else {
        ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
        ctx.status = 401;
    }
});
const getById = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = ctx.params.id;
    console.log('user.id ' + ctx.state.user.user.id);
    console.log('params.id ' + id);
    if (ctx.state.user.user.role === 'admin' || ctx.state.user.user.id == id) {
        let user = yield model.getByUserId(id);
        if (user.length) {
            ctx.body = user[0];
        }
    }
    else {
        ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
        ctx.status = 401;
    }
});
const createUser = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = ctx.request.body;
    let avatarurl = ' ';
    if (body.avatarurl)
        avatarurl = body.avatarurl;
    let username = body.username;
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashpwd = bcryptjs_1.default.hashSync(`${body.password}`, salt);
    let email = body.email;
    let role = 'user';
    let secretkey = body.actiCode;
    let secretList = ["mongkok_123456789", "mongkok_987654321", "shatin_123456789", "shatin_987654321", "chaiwan_123456789", "chaiwan_987654321"];
    if (secretkey) {
        for (let i = 0; i < secretList.length; i++)
            if (secretkey == secretList[i]) {
                role = 'admin';
                break;
            }
    }
    console.log("role ", role);
    let newUser = { username: username, password: hashpwd, passwordsalt: salt, email: email, avatarurl: avatarurl, role: role };
    let result = yield model.add(newUser);
    if (result) {
        ctx.status = 201;
        ctx.body = result;
    }
    else {
        ctx.status = 201;
        ctx.body = "{message:New user created}";
    }
});
const login = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    // return any details needed by the client
    const user = ctx.state.user;
    // const { id, username, email, avatarurl, role } =ctx.state.user;
    const id = user.user.id;
    const username = user.user.username;
    const email = user.user.email;
    const avatarurl = user.user.avatarurl;
    const about = user.user.about;
    const role = user.user.role;
    const links = {
        self: `http://${ctx.host}${prefix}/${id}`,
    };
    ctx.body = { id, username, email, about, avatarurl, role, links };
});
const updateUser = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let id = +ctx.params.id;
    let c = ctx.request.body;
    let pwd = c.password;
    let hash = ctx.state.user.user.password;
    if (pwd == '') // No update pwd  input
     {
        //console.log('hash '+hash)
        c.password = hash;
        //console.log('c.password '+c.password)
    }
    if (!bcryptjs_1.default.compareSync(pwd, hash) && pwd != '') //Encrypte & update  new pwd 
     {
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hashpwd = bcryptjs_1.default.hashSync(`${pwd}`, salt);
        // console.log('hashpwd  '+ hashpwd )
        c.password = hashpwd;
        // console.log('hashpwd  '+ c.password )
    }
    else {
        c.password = hash;
    } // New pwd = old pwd
    if (ctx.state.user.user.role === 'admin' || ctx.state.user.user.id == id) {
        let result = yield model.update(c, id);
        if (result) {
            ctx.status = 201;
            ctx.body = `User with id ${id} updated`;
        }
    }
    else {
        ctx.body = { msg: ' Profile records can be updated by its owner or admin role' };
        ctx.status = 401;
    }
});
const deleteUser = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = +ctx.params.id;
    if (ctx.state.user.user.role === 'admin' || ctx.state.user.user.id == id) {
        let user = yield model.deleteById(id);
        ctx.status = 201;
        ctx.body = `User with id ${id} deleted`;
        yield next();
    }
    else {
        ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
        ctx.status = 401;
    }
});
router.get('/', auth_1.basicAuth, doSearch);
//router.get('/search', basicAuth, doSearch);
router.post('/', (0, koa_bodyparser_1.default)(), validation_1.validateUser, createUser);
router.get('/:id([0-9]{1,})', auth_1.basicAuth, getById);
router.put('/:id([0-9]{1,})', auth_1.basicAuth, (0, koa_bodyparser_1.default)(), updateUser);
router.del('/:id([0-9]{1,})', auth_1.basicAuth, deleteUser);
router.post('/login', auth_1.basicAuth, login);
