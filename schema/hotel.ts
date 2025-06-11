import Joi from 'joi';

export interface Hotel {
  id?: number;
  name: string;
  location: string;
  price: number;
  availability: { date: string; roomsAvailable: number }[];
  amenities: string[];
  imageUrl?: string; // Standardize on camelCase for API
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
  imageUrl: Joi.alternatives()
    .try(
      Joi.string().uri().allow('').optional(), // Accept imageUrl
      Joi.object({
        image_url: Joi.string().uri().allow('').optional(), // Accept image_url
      }).unknown(true)
    )
    .optional(),
  description: Joi.string().allow(''),
  rating: Joi.number().min(0).max(5),
  createdBy: Joi.number().min(1).optional(), // Allow server to set createdBy
}).min(1).custom((value, helpers) => {
  // Normalize image_url to imageUrl
  if (value.image_url && !value.imageUrl) {
    value.imageUrl = value.image_url;
    delete value.image_url;
  } else if (value.imageUrl && typeof value.imageUrl === 'object' && 'image_url' in value.imageUrl) {
    value.imageUrl = (value.imageUrl as { image_url: string }).image_url;
  }
  return value;
}); // Allow partial updates for PUT