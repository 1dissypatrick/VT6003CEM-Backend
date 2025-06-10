export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: 'operator' | 'user';
  avatarurl?: string;
  signupCode?: string;
}

export const userSchema = {
  type: 'object',
  required: ['username', 'password', 'email', 'role', 'signupCode'],
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 255 },
    email: {
      type: 'string',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
    role: { type: 'string', enum: ['operator', 'user'] },
    signupCode: { type: 'string', const: 'WANDERLUST2025' },
    avatarurl: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
};