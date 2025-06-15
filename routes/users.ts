import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { validateMiddleware } from '../controllers/validation';
import { userSchema } from '../schema/user.schema';
import * as model from '../models/users';
import { authMiddleware, operatorOnly, register, login, oauthGoogle } from '../controllers/auth';
import { Context, Next } from 'koa';
import { User } from '../schema/user.schema';
import { registerSchema, loginSchema, oauthSchema} from '../schema/auth';

const prefix = '/api/v1/users';
const router: Router = new Router({ prefix });

/**
 * Get all users (operator only).
 */
const getAll = async (ctx: Context, next: Next) => {
  const { limit = '20', page = '1' } = ctx.request.query;
  const limitNum = parseInt(limit as string, 10);
  const pageNum = parseInt(page as string, 10);
  const users = await model.getAll(limitNum, pageNum);
  ctx.body = users;
  await next();
};

/**
 * Search users by field (operator only).
 */
const doSearch = async (ctx: Context, next: Next) => {
  const { limit = '50', page = '1', fields = '', q = '' } = ctx.request.query;
  let limitNum = parseInt(limit as string, 10);
  let pageNum = parseInt(page as string, 10);
  limitNum = limitNum > 200 ? 200 : limitNum < 1 ? 10 : limitNum;
  pageNum = pageNum < 1 ? 1 : pageNum;

  if (ctx.state.user?.role === 'operator') {
    let result: User[];
    if (q) {
      result = await model.getSearch(fields as string | string[], q as string);
    } else {
      result = await model.getAll(limitNum, pageNum);
    }
    if (result.length && fields) {
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      const filteredResult: Partial<User>[] = result.map((record: User) => {
        const partial: Partial<User> = {};
        for (const field of fieldArray as (keyof User)[]) {
          if (field in record) {
            partial[field] = record[field] as any; // Use type assertion if necessary
          }
        }
        return partial;
      });
      ctx.body = filteredResult;
    } else {
      ctx.body = result;
    }
  } else {
    ctx.status = 401;
    ctx.body = { error: `${ctx.state.user?.role || 'unauthenticated'} role is not authorized` };
  }
  await next();
};

/**
 * Get a user by ID.
 */
const getById = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  if (ctx.state.user?.role === 'operator' || ctx.state.user?.id === id) {
    const user = await model.getByUserId(id);
    if (user) {
      ctx.body = user;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
    }
  } else {
    ctx.status = 401;
    ctx.body = { error: `${ctx.state.user?.role || 'unauthenticated'} role is not authorized` };
  }
  await next();
};

/**
 * Create a new operator.
 */
const createUser = async (ctx: Context, next: Next) => {
  await register(ctx, next);
};

/**
 * Update a user by ID.
 */
const updateUser = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  const userData = ctx.request.body as Partial<User>;
  if (ctx.state.user?.role === 'operator' || ctx.state.user?.id === id) {
    try {
      const result = await model.update(userData, id);
      if (result.status === 201) {
        ctx.status = 201;
        ctx.body = { message: `User with id ${id} updated` };
      } else {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  } else {
    ctx.status = 401;
    ctx.body = { error: 'Profile records can be updated by its owner or operator role' };
  }
  await next();
};

/**
 * Delete a user by ID.
 */
const deleteUser = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  if (ctx.state.user?.role === 'operator' || ctx.state.user?.id === id) {
    try {
      const result = await model.deleteById(id);
      if (result.affectedRows) {
        ctx.status = 201;
        ctx.body = { message: `User with id ${id} deleted` };
      } else {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  } else {
    ctx.status = 401;
    ctx.body = { error: 'Profile records can be deleted by its owner or operator role' };
  }
  await next();
};

router.get('/', authMiddleware, operatorOnly, getAll);
router.get('/search', authMiddleware, operatorOnly, doSearch);
router.post('/', bodyParser(), validateMiddleware(registerSchema), createUser);
router.get('/:id([0-9]{1,})', authMiddleware, getById);
router.put('/:id([0-9]{1,})', authMiddleware, bodyParser(), validateMiddleware(userSchema), updateUser);
router.delete('/:id([0-9]{1,})', authMiddleware, deleteUser);
router.post('/login', bodyParser(), validateMiddleware(loginSchema), login);
router.post('/oauth/google', bodyParser(), validateMiddleware(oauthSchema), oauthGoogle); // New OAuth endpoint

export { router };