import Joi from 'joi';

export interface Message {
  id?: number;
  senderId: number;
  recipientId: number;
  hotelId?: number;
  content: string;
  response?: string;
  sentAt?: string;
}

export const messageCreateSchema = Joi.object<Message>({
  recipientId: Joi.number().integer().positive().required(),
  hotelId: Joi.number().integer().positive().optional(),
  content: Joi.string().trim().min(1).max(1000).required(),
}).options({ stripUnknown: true });

export const messageRespondSchema = Joi.object<Message>({
  response: Joi.string().trim().min(1).max(1000).required(),
}).options({ stripUnknown: true });