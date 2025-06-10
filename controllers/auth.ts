// import { Context, Next } from 'koa';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { validate } from './validation';
// import { registerSchema, loginSchema, RegisterData, LoginData } from '../schema/auth';
// import { findByUsername, add } from '../models/users';
// import { User } from '../schema/user.schema';

// const SECRET_CODE = 'WANDERLUST2025';
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// /**
//  * Registers a new operator with a sign-up code.
//  * @param ctx Koa context
//  * @param next Koa next function
//  */
// export const register = async (ctx: Context, next: Next) => {
//   try {
//     const { username, password, signupCode, email } = validate<RegisterData>(registerSchema, ctx.request.body);
//     if (signupCode !== SECRET_CODE) {
//       ctx.status = 403;
//       ctx.body = { error: 'Invalid sign-up code' };
//       return;
//     }
//     const existingUser = await findByUsername(username);
//     if (existingUser.length > 0) {
//       ctx.status = 400;
//       ctx.body = { error: 'Username already exists' };
//       return;
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser: Omit<User, 'id'> = {
//       username,
//       password: hashedPassword,
//       email,
//       role: 'operator',
//       avatarurl: '',
//     };
//     const userId = await add(newUser);
//     const token = jwt.sign({ id: userId, username, role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
//     ctx.status = 201;
//     ctx.body = { token, username, email, role: 'operator' };
//     return;
//   } catch (error) {
//     ctx.status = 500;
//     ctx.body = { error: (error as Error).message };
//     return;
//   }
// };

// /**
//  * Logs in an operator and returns a JWT.
//  * @param ctx Koa context
//  * @param next Koa next function
//  */
// export const login = async (ctx: Context, next: Next) => {
//   try {
//     const { username, password } = validate<LoginData>(loginSchema, ctx.request.body);
//     const users = await findByUsername(username);
//     if (users.length === 0) {
//       ctx.status = 404;
//       ctx.body = { error: 'User not found' };
//       return;
//     }
//     const user = users[0];
//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) {
//       ctx.status = 401;
//       ctx.body = { error: 'Invalid password' };
//       return;
//     }
//     const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
//     ctx.status = 200;
//     ctx.body = { token, id: user.id, username: user.username, role: user.role };
//     return;
//   } catch (error) {
//     ctx.status = 500;
//     ctx.body = { error: (error as Error).message };
//     return;
//   }
// };

// /**
//  * Middleware to verify JWT.
//  * @param ctx Koa context
//  * @param next Koa next function
//  */
// export const authMiddleware = async (ctx: Context, next: Next) => {
//   const authHeader = ctx.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     ctx.status = 401;
//     ctx.body = { error: 'No token provided' };
//     return;
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
//     ctx.state.user = decoded;
//     await next();
//   } catch (error) {
//     ctx.status = 401;
//     ctx.body = { error: 'Invalid token' };
//     return;
//   }
// };

// /**
//  * Middleware to restrict access to operators.
//  * @param ctx Koa context
//  * @param next Koa next function
//  */
// export const operatorOnly = async (ctx: Context, next: Next) => {
//   if (!ctx.state.user?.role || ctx.state.user.role !== 'operator') {
//     ctx.status = 403;
//     ctx.body = { error: 'Operator access required' };
//     return;
//   }
//   await next();
// };
import { Context, Next } from 'koa';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate } from './validation';
import { registerSchema, loginSchema, RegisterData, LoginData } from '../schema/auth';
import { findByUsername, add } from '../models/users';
import { User } from '../schema/user.schema';

const SECRET_CODE = 'WANDERLUST2025';
const JWT_SECRET = process.env.JWT_SECRET || '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export const register = async (ctx: Context, next: Next) => {
  try {
    const { username, password, signupCode, email } = validate<RegisterData>(registerSchema, ctx.request.body);
    if (signupCode !== SECRET_CODE) {
      ctx.status = 403;
      ctx.body = { error: 'Invalid sign-up code' };
      return;
    }
    const existingUser = await findByUsername(username);
    if (existingUser.length > 0) {
      ctx.status = 400;
      ctx.body = { error: 'Username already exists' };
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: Omit<User, 'id'> & { signupCode?: string } = {
      username,
      password: hashedPassword,
      email,
      role: 'operator',
      avatarurl: '',
      signupCode, // Pass signupCode to add
    };
    const userId = await add(newUser);
    const token = jwt.sign({ id: userId, username, role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
    ctx.status = 201;
    ctx.body = { token, username, email, role: 'operator' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

export const login = async (ctx: Context, next: Next) => {
  try {
    const { username, password } = validate<LoginData>(loginSchema, ctx.request.body);
    const users = await findByUsername(username);
    if (users.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid password' };
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    ctx.status = 200;
    ctx.body = { token, id: user.id, username: user.username, role: user.role };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'No token provided' };
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
  }
};

export const operatorOnly = async (ctx: Context, next: Next) => {
  if (!ctx.state.user?.role || ctx.state.user.role !== 'operator') {
    ctx.status = 403;
    ctx.body = { error: 'Operator access required' };
    return;
  }
  await next();
};