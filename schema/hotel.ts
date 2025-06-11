// src/schema/hotel.ts
import Joi from 'joi';

export interface Hotel {
  id?: number;
  name: string;
  location: string;
  price: number;
  availability: { date: string; roomsAvailable: number }[];
  amenities: string[];
  imageUrl?: string;
  description?: string;
  rating?: number;
  createdBy: number;
}

export const hotelSchema = Joi.object<Hotel>({
  name: Joi.string().min(1).required(),
  location: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  availability: Joi.array()
    .items(
      Joi.object({
        date: Joi.string().isoDate().required(),
        roomsAvailable: Joi.number().min(0).required(),
      })
    )
    .required(),
  amenities: Joi.array().items(Joi.string()).required(),
  imageUrl: Joi.string().uri().allow(''),
  description: Joi.string().allow(''),
  rating: Joi.number().min(0).max(5),
  createdBy: Joi.number().min(1).required(),
}).min(1); // Allow partial updates for PUT