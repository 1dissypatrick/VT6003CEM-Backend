import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Context, Next } from 'koa';
import { authMiddleware } from '../controllers/auth';
import { validateMiddleware } from '../controllers/validation';
import { favoriteSchema } from '../schema/favorite.schema';
import * as model from '../models/favorites';

const prefix = '/api/v1/favorites';
const router: Router = new Router({ prefix });

/**
 * Add a hotel to user's favorites.
 */
const addFavorite = async (ctx: Context, next: Next) => {
  const { hotelId } = ctx.request.body as { hotelId: number };
  const userId = ctx.state.user.id;
  console.log('addFavorite: Adding favorite for userId=', userId, 'hotelId=', hotelId);
  try {
    const favorite = await model.add(userId, hotelId);
    ctx.status = 201;
    ctx.body = favorite;
  } catch (error) {
    console.error('addFavorite: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

/**
 * Get all favorites for the authenticated user.
 */
const getFavorites = async (ctx: Context, next: Next) => {
  const userId = ctx.state.user.id;
  console.log('getFavorites: Retrieving favorites for userId=', userId);
  try {
    const favorites = await model.getByUserId(userId);
    ctx.status = 200;
    ctx.body = favorites;
  } catch (error) {
    console.error('getFavorites: Error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

/**
 * Remove a hotel from user's favorites.
 */
const removeFavorite = async (ctx: Context, next: Next) => {
  const hotelId = parseInt(ctx.params.hotelId, 10);
  const userId = ctx.state.user.id;
  console.log('removeFavorite: Removing favorite for userId=', userId, 'hotelId=', hotelId);
  if (isNaN(hotelId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  try {
    const result = await model.remove(userId, hotelId);
    if (result.rowsAffected === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Favorite not found' };
    } else {
      ctx.status = 200;
      ctx.body = { message: 'Favorite removed successfully' };
    }
  } catch (error) {
    console.error('removeFavorite: Error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

router.post('/', authMiddleware, bodyParser(), validateMiddleware(favoriteSchema), addFavorite);
router.get('/', authMiddleware, getFavorites);
router.delete('/:hotelId([0-9]{1,})', authMiddleware, removeFavorite);

export { router };