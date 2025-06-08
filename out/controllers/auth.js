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
exports.basicAuth = void 0;
const koa_passport_1 = __importDefault(require("koa-passport"));
const passport_http_1 = require("passport-http");
const users = __importStar(require("../models/users"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const verifyPassword = (user, password) => {
    console.log('db loaded user hashed pwd: ' + user.password);
    console.log('input password ' + password);
    const hash = user.password;
    return bcryptjs_1.default.compareSync(password, hash);
};
koa_passport_1.default.use(new passport_http_1.BasicStrategy((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    // Replace this with your own authentication logic
    /*if (username === "admin" && password === "password") {tsc
  
      done(null, { username: "admin" });
    } else {
      done(null, false);
    } */
    let result = [];
    try {
        result = yield users.findByUsername(username);
        console.log('user found');
    }
    catch (error) {
        console.error(`Error during authentication for user ${username}: ${error}`);
        done(null, false);
    }
    if (result.length) {
        const user = result[0];
        console.log('username: ' + user.username);
        if (verifyPassword(user, password)) {
            console.log('done');
            done(null, { user: user });
        }
        else {
            console.log(`Password incorrect for ${username}`);
            done(null, false);
        }
    }
    else {
        console.log(`No user found with username ${username}`);
        done(null, false);
    }
})));
const basicAuth = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield koa_passport_1.default.authenticate("basic", { session: false })(ctx, next);
    if (ctx.status == 401) {
        ctx.body = {
            message: 'you are not authorized'
        };
    }
    /*
      else {
       const user = ctx.state.user;
         console.log('user=> '+JSON.stringify(user))
        console.log('status=> '+ctx.status)
      ctx.body = {message: `Hello ${user.user.username} you registered on ${user.user.dateregistered}`}
        }
        */
});
exports.basicAuth = basicAuth;
