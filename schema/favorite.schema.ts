import Joi from 'joi';

export interface Favorite {
  id?: number;
  userId: number;
  hotelId: number;
  hotelName: string;
  createdAt?: string;
}

export const favoriteSchema = Joi.object<Favorite>({
  hotelId: Joi.number().integer().positive().required(),
}).options({ stripUnknown: true });