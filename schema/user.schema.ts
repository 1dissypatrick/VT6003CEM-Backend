import Joi from 'joi';

export interface User {
  id: number;
  username: string;
  password?: string; // Optional for updates
  email: string;
  role: 'user' | 'operator';
  avatarurl?: string | null; // Allow null
  signupCode?: string | null; // Allow null
}

export const userSchema = Joi.object<User>({
  username: Joi.string().min(3).max(255),
  password: Joi.string().min(8).max(255),
  email: Joi.string().email(),
  role: Joi.string().valid('user', 'operator'),
  avatarurl: Joi.string().uri().allow('', null).max(255), // Allow null
  signupCode: Joi.string().allow('', null), // Allow null
}).min(1); // Require at least one field for partial updates