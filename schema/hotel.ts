export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  availability: boolean;
  description?: string;
  rating?: number;
}

export const hotelSchema = {
  type: 'object',
  required: ['name', 'location', 'price', 'availability'],
  properties: {
    name: { type: 'string', minLength: 1 },
    location: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    availability: { type: 'boolean' },
    description: { type: 'string', minLength: 1 },
    rating: { type: 'number', minimum: 0, maximum: 5 },
  },
  additionalProperties: false,
};