// src/schema/hotel.ts
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

export const hotelSchema = {
  type: 'object',
  required: ['name', 'location', 'price', 'availability', 'amenities', 'createdBy'],
  properties: {
    name: { type: 'string', minLength: 1 },
    location: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    availability: {
      type: 'array',
      items: {
        type: 'object',
        required: ['date', 'roomsAvailable'],
        properties: {
          date: { type: 'string', format: 'date' },
          roomsAvailable: { type: 'number', minimum: 0 },
        },
      },
    },
    amenities: { type: 'array', items: { type: 'string' } },
    imageUrl: { type: 'string', format: 'uri' },
    description: { type: 'string', minLength: 1 },
    rating: { type: 'number', minimum: 0, maximum: 5 },
    createdBy: { type: 'number', minimum: 1 },
  },
  additionalProperties: true, // Allow extra fields for flexibility
};