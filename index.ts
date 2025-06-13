import 'dotenv/config';
import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { router as userRouter } from './routes/users';
import { router as hotels } from './routes/hotels';
import { router as favoritesRouter } from './routes/favorites';
import serve from 'koa-static';

const app: Koa = new Koa();
const router: Router = new Router();

app.use(logger());
app.use(json());
app.use(bodyParser());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(serve('./docs'));

app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(hotels.routes()).use(hotels.allowedMethods());
app.use(favoritesRouter.routes()).use(favoritesRouter.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());

app.use(async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next();
    if (ctx.status === 404 && !ctx.body) {
      ctx.body = { error: 'Not found' };
    }
  } catch (err: any) {
    console.error('Error:', err);
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

const port = process.env.PORT || 10888;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;