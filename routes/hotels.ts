import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { authMiddleware, operatorOnly } from '../controllers/auth';
import { validateMiddleware } from '../controllers/validation';
import { hotelSchema } from '../schema/hotel';
import * as model from '../models/hotels';
import { Context, Next } from 'koa';
import { Hotel } from '../schema/hotel';

const prefix = '/api/v1/hotels';
const router: Router = new Router({ prefix });

/**
 * Get all hotels with optional search and filters.
 */
const getAll = async (ctx: Context, next: Next) => {
  const { limit = '10', page = '1', search = '', location = '', minPrice, maxPrice } = ctx.request.query;
  const hotels = await model.getAll(
    parseInt(limit as string, 10),
    parseInt(page as string, 10),
    search as string,
    location as string,
    minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice ? parseFloat(maxPrice as string) : undefined
  );
  ctx.body = hotels;
  await next();
};

/**
 * Get a hotel by ID.
 */
const getById = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  const hotel = await model.getById(id);
  if (hotel) {
    ctx.body = hotel;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
  }
  await next();
};

/**
 * Create a new hotel (operator only).
 */
const createHotel = async (ctx: Context, next: Next) => {
  const hotel = ctx.request.body as Omit<Hotel, 'id'>;
  const result = await model.add(hotel);
  if (result.status === 201) {
    ctx.status = 201;
    ctx.body = { id: result.data };
  } else {
    ctx.status = 400;
    ctx.body = { error: 'Failed to create hotel' };
  }
  await next();
};

/**
 * Update a hotel by ID (operator only).
 */
const updateHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  const hotel = ctx.request.body as Partial<Hotel>;
  const result = await model.update(hotel, id);
  if (result.status === 200) {
    ctx.status = 200;
    ctx.body = result.data;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
  }
  await next();
};

/**
 * Delete a hotel by ID (operator only).
 */
const deleteHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  const result = await model.deleteById(id);
  if (result.status === 200) {
    ctx.status = 200;
    ctx.body = { message: `Hotel with id ${id} deleted` };
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
  }
  await next();
};

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), authMiddleware, operatorOnly, validateMiddleware(hotelSchema), createHotel);
router.put('/:id([0-9]{1,})', bodyParser(), authMiddleware, operatorOnly, validateMiddleware(hotelSchema), updateHotel);
router.delete('/:id([0-9]{1,})', authMiddleware, operatorOnly, deleteHotel);

export { router };