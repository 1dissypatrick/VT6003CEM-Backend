// src/schema/auth.ts
import Joi from 'joi';

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  signupCode?: string;
  role?: 'user' | 'operator';
}

export interface LoginData {
  username: string;
  password: string;
}

export const registerSchema = Joi.object<RegisterData>({
  username: Joi.string().min(3).max(255).required(),
  password: Joi.string().min(8).max(255).required(), // Match userSchema
  email: Joi.string().email().required(),
  signupCode: Joi.string().when('role', {
    is: 'operator',
    then: Joi.string().valid('WANDERLUST2025').required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  role: Joi.string().valid('user', 'operator').default('user'),
});

export const loginSchema = Joi.object<LoginData>({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(8).required(), // Match userSchema
});