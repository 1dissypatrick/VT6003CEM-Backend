export interface RegisterData {
  username: string;
  password: string;
  signupCode: string;
  email: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export const registerSchema = {
  type: 'object',
  required: ['username', 'password', 'signupCode', 'email'],
  properties: {
    username: { type: 'string', minLength: 3 },
    password: { type: 'string', minLength: 6 },
    signupCode: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
};

export const loginSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string', minLength: 3 },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
};