import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { authMiddleware, operatorOnly } from '../controllers/auth';
import { validateMiddleware } from '../controllers/validation';
import { hotelSchema } from '../schema/hotel';
import * as model from '../models/hotels';
import { Context, Next } from 'koa';
import { Hotel } from '../schema/hotel';
import axios from 'axios';

const prefix = '/api/v1/hotels';
const router: Router = new Router({ prefix });

const postToSocialMedia = async (hotel: Hotel) => {
  try {
    await axios.post('https://api.mock-social-media.com/post', {
      message: `New hotel listed: ${hotel.name} in ${hotel.location} for $${hotel.price}/night!`,
    });
    console.log(`Posted to social media: ${hotel.name}`);
  } catch (error) {
    console.error('Failed to post to social media:', (error as Error).message);
  }
};

const injectCreatedBy = async (ctx: Context, next: Next) => {
  console.log('injectCreatedBy: User:', ctx.state.user);
  if (ctx.state.user?.id) {
    const body = ctx.request.body as Omit<Hotel, 'id'>;
    body.createdBy = ctx.state.user.id;
    ctx.request.body = body;
  } else {
    ctx.status = 401;
    ctx.body = { error: 'User not authenticated' };
    return;
  }
  await next();
};

const getAll = async (ctx: Context, next: Next) => {
  const { limit = '10', page = '1', search = '', location = '', minPrice, maxPrice } = ctx.request.query;
  console.log('getAll: Query params:', { limit, page, search, location, minPrice, maxPrice });
  try {
    const hotels = await model.getAll(
      parseInt(limit as string, 10),
      parseInt(page as string, 10),
      search as string,
      location as string,
      minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice ? parseFloat(maxPrice as string) : undefined
    );
    console.log('getAll: Hotels retrieved:', hotels, 'Count:', hotels.length);
    ctx.status = 200;
    ctx.body = hotels;
  } catch (error) {
    console.error('getAll: Error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const getById = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  console.log('getById: Hotel ID:', id);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  try {
    const hotel = await model.getById(id);
    console.log('getById: Hotel retrieved:', hotel);
    if (hotel) {
      ctx.status = 200;
      ctx.body = hotel;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
    }
  } catch (error) {
    console.error('getById: Error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const createHotel = async (ctx: Context, next: Next) => {
  const hotel = ctx.request.body as Omit<Hotel, 'id'>;
  const { postToSocial = false } = ctx.request.body as { postToSocial?: boolean };
  console.log('createHotel: Hotel data:', hotel, 'postToSocial:', postToSocial);
  try {
    const result = await model.add(hotel);
    console.log('createHotel: Result:', result);
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
    console.error('createHotel: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const updateHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  console.log('updateHotel: Hotel ID:', id);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  const hotel = ctx.request.body as Partial<Hotel>;
  console.log('updateHotel: Hotel data:', hotel);
  try {
    const result = await model.update(hotel, id);
    console.log('updateHotel: Result:', result);
    if (result.status === 200) {
      ctx.status = 200;
      ctx.body = result.data;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
    }
  } catch (error) {
    console.error('updateHotel: Error:', error);
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

const deleteHotel = async (ctx: Context, next: Next) => {
  const id = parseInt(ctx.params.id, 10);
  console.log('deleteHotel: Attempting to delete hotel id=', id);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid hotel ID' };
    return;
  }
  try {
    const result = await model.deleteById(id);
    console.log('deleteHotel: Result for id=', id, ':', result);
    ctx.status = result.status;
    ctx.body = result.status === 200 ? { message: `Hotel with id ${id} deleted` } : { error: 'Hotel not found' };
  } catch (error) {
    console.error('deleteHotel: Error for id=', id, ':', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), authMiddleware, operatorOnly, injectCreatedBy, validateMiddleware(hotelSchema), createHotel);
router.put('/:id([0-9]{1,})', bodyParser(), authMiddleware, operatorOnly, validateMiddleware(hotelSchema), updateHotel);
router.delete('/:id([0-9]{1,})', authMiddleware, operatorOnly, deleteHotel);

export { router };