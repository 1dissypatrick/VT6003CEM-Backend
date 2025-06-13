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
exports.remove = exports.respond = exports.getByUserId = exports.add = void 0;
const db = __importStar(require("../helpers/database"));
const add = (senderId, recipientId, hotelId, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (!senderId || isNaN(senderId)) {
        throw new Error('Invalid sender ID');
    }
    if (!recipientId || isNaN(recipientId)) {
        throw new Error('Invalid recipient ID');
    }
    const userQuery = 'SELECT id, role FROM users WHERE id = :recipientId';
    const users = yield db.run_query(userQuery, { recipientId: recipientId.toString() });
    if (!users.length || users[0].role !== 'operator') {
        throw new Error('Recipient must be an operator');
    }
    if (hotelId) {
        const hotelQuery = 'SELECT id FROM hotels WHERE id = :hotelId';
        const hotels = yield db.run_query(hotelQuery, { hotelId: hotelId.toString() });
        if (!hotels.length) {
            throw new Error('Hotel not found');
        }
    }
    const query = 'INSERT INTO messages (sender_id, recipient_id, hotel_id, content) ' +
        'VALUES (:senderId, :recipientId, :hotelId, :content) ' +
        'RETURNING id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt"';
    try {
        const result = yield db.run_insert(query, {
            senderId: String(senderId),
            recipientId: String(recipientId),
            hotelId: hotelId ? String(hotelId) : null,
            content,
        });
        console.log('add: Inserted message:', result);
        return result;
    }
    catch (error) {
        console.error('add: Error:', error);
        throw new Error(`Failed to send message: ${error.message}`);
    }
});
exports.add = add;
const getByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt" ' +
        'FROM messages WHERE sender_id = :userId OR recipient_id = :userId ORDER BY sent_at DESC';
    try {
        const results = yield db.run_query(query, { userId: String(userId) });
        console.log('getByUserId: Retrieved messages for userId=', userId, ':', results);
        return results !== null && results !== void 0 ? results : [];
    }
    catch (error) {
        console.error('getByUserId: Error:', error);
        throw new Error(`Failed to retrieve messages: ${error.message}`);
    }
});
exports.getByUserId = getByUserId;
const respond = (messageId, response, operatorId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'UPDATE messages SET response = :response WHERE id = :messageId AND recipient_id = :operatorId ' +
        'RETURNING id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt"';
    try {
        const results = yield db.run_update(query, {
            messageId: String(messageId),
            response,
            operatorId: String(operatorId),
        });
        if (!results || results.length === 0) {
            throw new Error('Message not found or unauthorized');
        }
        const result = results[0];
        console.log('respond: Updated messageId=', messageId, ':', result);
        return result;
    }
    catch (error) {
        console.error('respond: Error:', error);
        throw new Error(`Failed to respond to message: ${error.message}`);
    }
});
exports.respond = respond;
const remove = (messageId, operatorId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM messages WHERE id = :messageId AND (sender_id = :operatorId OR recipient_id = :operatorId)';
    try {
        const result = yield db.run_delete(query, { messageId: String(messageId), operatorId: String(operatorId) });
        console.log('remove: Deleted messageId=', messageId, 'for operatorId=', operatorId, 'rowsAffected:', result.rowsAffected);
        return result;
    }
    catch (error) {
        console.error('remove: Error:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
    }
});
exports.remove = remove;
