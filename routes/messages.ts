import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Context, Next } from 'koa';
import { authMiddleware } from '../controllers/auth';
import { validateMiddleware } from '../controllers/validation';
import { messageCreateSchema, messageRespondSchema } from '../schema/message.schema';
import * as model from '../models/messages';

const prefix = '/api/v1/messages';
const router: Router = new Router({ prefix });

/**
 * Send a new message to an operator.
 */
const sendMessage = async (ctx: Context, next: Next) => {
  const { id: senderId } = ctx.state.user; // Changed from senderId to id
  const { recipientId, hotelId, content } = ctx.request.body as any;
  console.log('sendMessage: Sending message from senderId=', senderId, 'to recipientId=', recipientId, 'hotelId=', hotelId, 'user=', ctx.state.user);
  try {
    const message = await model.add(senderId, recipientId, hotelId || null, content);
    ctx.status = 201;
    ctx.body = message;
  } catch (error) {
    console.error('sendMessage: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

/**
 * Get all messages for the authenticated user.
 */
const getMessages = async (ctx: Context, next: Next) => {
  const { id: userId } = ctx.state.user;
  console.log('getMessages: Retrieving messages for userId=', userId);
  try {
    const messages = await model.getByUserId(userId);
    ctx.status = 200;
    ctx.body = messages;
  } catch (error) {
    console.error('getMessages: Error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

/**
 * Respond to a message (operator only).
 */
const respondMessage = async (ctx: Context, next: Next) => {
  const { id: operatorId, role } = ctx.state.user;
  const messageId = parseInt(ctx.params.messageId, 10);
  const { response } = ctx.request.body as any;
  console.log('respondMessage: OperatorId=', operatorId, 'responding to messageId=', messageId);
  if (role !== 'operator') {
    ctx.status = 403;
    ctx.body = { error: 'Only operators can respond to messages' };
    return;
  }
  if (isNaN(messageId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid message ID' };
    return;
  }
  try {
    const updatedMessage = await model.respond(messageId, response, operatorId);
    ctx.status = 200;
    ctx.body = updatedMessage;
  } catch (error) {
    console.error('respondMessage: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

/**
 * Delete a message (operator only).
 */
const deleteMessage = async (ctx: Context, next: Next) => {
  const { id: operatorId, role } = ctx.state.user;
  const messageId = parseInt(ctx.params.messageId, 10);
  console.log('deleteMessage: OperatorId=', operatorId, 'deleting messageId=', messageId);
  if (role !== 'operator') {
    ctx.status = 403;
    ctx.body = { error: 'Only operators can delete messages' };
    return;
  }
  if (isNaN(messageId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid message ID' };
    return;
  }
  try {
    const result = await model.remove(messageId, operatorId);
    if (result.rowsAffected === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Message not found or unauthorized' };
    } else {
      ctx.status = 200;
      ctx.body = { message: 'Message deleted successfully' };
    }
  } catch (error) {
    console.error('deleteMessage: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

router.post('/', authMiddleware, bodyParser(), validateMiddleware(messageCreateSchema), sendMessage);
router.get('/', authMiddleware, getMessages);
router.patch('/:messageId([0-9]{1,})', authMiddleware, bodyParser(), validateMiddleware(messageRespondSchema), respondMessage);
router.delete('/:messageId([0-9]{1,})', authMiddleware, deleteMessage);

export { router };