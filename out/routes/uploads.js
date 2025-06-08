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
const koa_body_1 = __importDefault(require("koa-body"));
const mime_types_1 = __importDefault(require("mime-types"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const upload_options = {
    multipart: true,
    formidable: { uploadDir: './img' }
};
const koaBodyM = (0, koa_body_1.default)(upload_options);
const fileStore = './img';
const router = new koa_router_1.default({ prefix: '/api/v1' });
exports.router = router;
router.post('/images', koaBodyM, (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const upload = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.upload;
        let path;
        let name;
        let type;
        ;
        let extension;
        if (Array.isArray(upload)) {
            // Handle if 'upload' is an array of files
            if (upload.length > 0) {
                path = upload[0].filepath;
                name = upload[0].newFilename;
                type = upload[0].mimetype || '';
            }
        }
        else {
            // Handle if 'upload' is a single file
            path = upload === null || upload === void 0 ? void 0 : upload.filepath;
            name = upload === null || upload === void 0 ? void 0 : upload.newFilename;
            type = (upload === null || upload === void 0 ? void 0 : upload.mimetype) || '';
        }
        if (type) {
            extension = mime_types_1.default.extension(type) || null;
        }
        else {
            // Handle the case where 'type' is undefined
            extension = null;
        }
        //const {path, name, type} = ctx.request.files.upload;
        //const path:string|undefined = ctx.request.files?.upload?.filepath ;
        //const name:string|undefined = ctx.request.files?.upload?.newFilename 
        //const type:string |undefined= ctx.request.files?.upload?.mimetype;  
        //const   extension = mime.extension(type)
        // console.log('Uploaded file details: '+JSON.stringify(ctx.request.files))
        // add some logging to help with troubleshooting
        console.log('Uploaded file details:');
        console.log(`path: ${path}`);
        console.log(`filename: ${name}`);
        console.log(`type: ${type}`);
        console.log(`extension: ${extension}`);
        const imageName = (0, uuid_1.v4)();
        const newPath = `${fileStore}/${imageName}`;
        if (path) {
            (0, fs_1.copyFileSync)(path, newPath);
        }
        else {
            throw new Error('Path is not defined for copying the file.');
        }
        ctx.status = 201;
        ctx.body = {
            filename: name,
            type: type,
            extension: extension,
            links: {
                path: `http://${ctx.host}${router.url('get_image', imageName)}`
            }
        };
    }
    catch (err) {
        console.log(`error ${err.message}`);
        ctx.throw(500, 'upload error', { message: err.message });
    }
}));
router.get('get_image', '/images/:uuid([0-9a-f\\-]{36})', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = ctx.params.uuid;
    const path = `${fileStore}/${uuid}`;
    console.log('client requested image with path', path);
    try {
        // find the requested file and return it
        if ((0, fs_1.existsSync)(path)) {
            console.log('image found');
            const src = (0, fs_1.createReadStream)(path);
            ctx.type = 'image/jpeg';
            ctx.body = src;
            ctx.status = 200;
        }
        else {
            console.log('image not found');
            ctx.status = 404;
        }
    }
    catch (err) {
        console.log(`error ${err.message}`);
        ctx.throw(500, 'image download error', { message: err.message });
    }
}));
