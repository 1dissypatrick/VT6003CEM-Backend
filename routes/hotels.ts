// src/controllers/hotels.ts
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { authMiddleware, operatorOnly } from '../controllers/auth';
import { validateMiddleware } from '../controllers/validation';
import { hotelSchema } from '../schema/hotel';
import * as model from '../models/hotels';
import { Context, Next } from 'koa';
import { Hotel } from '../schema/hotel';
import axios from 'axios'; // For social media posting

const prefix = '/api/v1/hotels';
const router: Router = new Router({ prefix });

const postToSocialMedia = async (hotel: Hotel) => {
  try {
    // Mock social media API (replace with real API, e.g., Twitter, Facebook)
    await axios.post('https://api.mock-social-media.com/post', {
      message: `New hotel listed: ${hotel.name} in ${hotel.location} for $${hotel.price}/night!`,
    });
    console.log(`Posted to social media: ${hotel.name}`);
  } catch (error) {
    console.error('Failed to post to social media:', (error as Error).message);
  }
};

const getAll = async (ctx: Context, next: Next) => {
  const { limit = '10', page = '1', search = '', location = '', minPrice, maxPrice } = ctx.request.query;
  try {
    const hotels = await model.getAll(
      parseInt(limit as string, 10),
      parseInt(page as string, 10),
      search as string,
      location as string,
      minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice ? parseFloat(maxPrice as string) : undefined
    );
    ctx.status = 200;
    ctx.body = hotels;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const getById = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  try {
    const hotel = await model.getById(id);
    if (hotel) {
      ctx.status = 200;
      ctx.body = hotel;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const createHotel = async (ctx: Context, next: Next) => {
  const hotel = ctx.request.body as Omit<Hotel, 'id'>;
  hotel.createdBy = ctx.state.user.id; // Set createdBy from JWT
  const { postToSocial } = ctx.request.body as { postToSocial?: boolean };
  try {
    const result = await model.add(hotel);
    if (result.status === 201) {
      const newHotel = { ...hotel, id: result.data };
      if (postToSocial) {
        await postToSocialMedia(newHotel);
      }
      ctx.status = 201;
      ctx.body = newHotel;
    } else {
      ctx.status = 400;
      ctx.body = { error: 'Failed to create hotel' };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const updateHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  const hotel = ctx.request.body as Partial<Hotel>;
  try {
    const result = await model.update(hotel, id);
    if (result.status === 200) {
      ctx.status = 200;
      ctx.body = result.data;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const deleteHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  try {
    const result = await model.deleteById(id);
    if (result.status === 200) {
      ctx.status = 200;
      ctx.body = { message: `Hotel with id ${id} deleted` };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), authMiddleware, operatorOnly, validateMiddleware(hotelSchema), createHotel);
router.put('/:id([0-9]{1,})', bodyParser(), authMiddleware, operatorOnly, validateMiddleware(hotelSchema), updateHotel);
router.delete('/:id([0-9]{1,})', authMiddleware, operatorOnly, deleteHotel);

export { router };