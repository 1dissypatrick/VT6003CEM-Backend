import 'dotenv/config';
import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { router as userRouter } from './routes/users';
import { router as hotels } from './routes/hotels';
import serve from 'koa-static';

const app: Koa = new Koa();
const router: Router = new Router();

app.use(serve('./docs'));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(logger());
app.use(json());
app.use(bodyParser());
app.use(router.routes());
app.use(userRouter.middleware());
app.use(hotels.middleware());

app.use(async (ctx: any, next: any) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.body = { error: 'No such endpoint exists' };
    }
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

const port = process.env.PORT || 10888;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;