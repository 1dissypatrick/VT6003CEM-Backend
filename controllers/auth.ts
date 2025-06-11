import { Context, Next } from 'koa';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findByUsername, add } from '../models/users';
import { User } from '../schema/user.schema';

const SECRET_CODE = 'WANDERLUST2025';
const JWT_SECRET = process.env.JWT_SECRET || '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export const register = async (ctx: Context, next: Next) => {
  try {
    console.log('Request body:', ctx.request.body);
    const { username, password, signupCode, email, role = 'user' } = ctx.request.body as {
      username: string;
      password: string;
      signupCode?: string;
      email: string;
      role?: 'user' | 'operator';
    };
    console.log('Validated data:', { username, password, signupCode, email, role });
    if (role === 'operator') {
      if (!signupCode || signupCode.toUpperCase() !== SECRET_CODE) {
        ctx.status = 403;
        ctx.body = { error: 'Invalid signup code' };
        return;
      }
    }
    const existingUser = await findByUsername(username);
    if (existingUser.length > 0) {
      ctx.status = 400;
      ctx.body = { error: 'Username already exists' };
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: Omit<User, 'id'> & { signupCode?: string | null } = {
      username,
      password: hashedPassword,
      email,
      role,
      avatarurl: null,
      signupCode: role === 'operator' ? signupCode : null,
    };
    console.log('New user to add:', newUser);
    try {
      const userId = await add(newUser);
      const token = jwt.sign({ id: userId, username, role }, JWT_SECRET, { expiresIn: '1h' });
      ctx.status = 201;
      ctx.body = { token, username, email, role };
    } catch (dbError) {
      console.error('Database error:', dbError);
      ctx.status = 500;
      ctx.body = { error: 'Failed to create user: ' + (dbError as Error).message };
      return;
    }
  } catch (error) {
    console.error('Registration error:', error);
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
  await next();
};

export const login = async (ctx: Context, next: Next) => {
  try {
    console.log('Login request body:', ctx.request.body);
    const { username, password } = ctx.request.body as { username: string; password: string };
    const users = await findByUsername(username);
    console.log('Users found:', users);
    if (!users.length) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    const user = users[0];
    if (!user || !user.password) {
      ctx.status = 400;
      ctx.body = { error: 'User data incomplete' };
      return;
    }
    console.log('Comparing password:', password, 'with hash:', user.password);
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
    if (!isValid) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid password' };
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    ctx.status = 200;
    ctx.body = { token, id: user.id, username: user.username, role: user.role };
  } catch (error) {
    console.error('Login error:', error);
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