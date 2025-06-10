// import * as db from '../helpers/database';
// import { Hotel } from '../schema/hotel';

// /**
//  * Get all hotels with optional search and filters.
//  */
// export const getAll = async (
//   limit = 10,
//   page = 1,
//   search = '',
//   location = '',
//   minPrice?: number,
//   maxPrice?: number
// ): Promise<Hotel[]> => {
//   const offset = (page - 1) * limit;
//   let query = 'SELECT id, name, description, location, price, rating FROM hotels WHERE 1=1';
//   const values: any[] = [];
//   if (search) {
//     query += ' AND name ILIKE ?';
//     values.push(`%${search}%`);
//   }
//   if (location) {
//     query += ' AND location ILIKE ?';
//     values.push(`%${location}%`);
//   }
//   if (minPrice !== undefined) {
//     query += ' AND price >= ?';
//     values.push(minPrice);
//   }
//   if (maxPrice !== undefined) {
//     query += ' AND price <= ?';
//     values.push(maxPrice);
//   }
//   query += ' LIMIT ? OFFSET ?';
//   values.push(limit, offset);
//   return await db.run_query<Hotel>(query, values);
// };

// /**
//  * Get a hotel by ID.
//  */
// export const getById = async (id: number): Promise<Hotel | null> => {
//   const query = 'SELECT id, name, description, location, price, rating FROM hotels WHERE id = ?';
//   const results = await db.run_query<Hotel>(query, [id]);
//   return results.length > 0 ? results[0] : null;
// };

// /**
//  * Add a new hotel.
//  */
// export const add = async (hotel: Omit<Hotel, 'id'>): Promise<{ status: number; data: number }> => {
//   const { name, description, location, price, rating } = hotel;
//   const query =
//     'INSERT INTO hotels (name, description, location, price, rating) VALUES (?, ?, ?, ?, ?) RETURNING id';
//   const result = await db.run_insert<{ id: number }>(query, [name, description, location, price, rating || null]);
//   return { status: 201, data: result.id };
// };

// /**
//  * Update a hotel by ID.
//  */
// export const update = async (hotel: Partial<Hotel>, id: number): Promise<{ status: number; data: Hotel }> => {
//   const keys = Object.keys(hotel) as (keyof Hotel)[];
//   const values = Object.values(hotel);
//   const updateString = keys.map((key, index) => `${key}=$${index + 1}`).join(', ');
//   const query = `UPDATE hotels SET ${updateString} WHERE id=$${keys.length + 1} RETURNING *`;
//   values.push(id);
//   try {
//     const result = await db.run_update<Hotel>(query, values);
//     return { status: 200, data: result[0] };
//   } catch (error) {
//     return { status: 404, data: {} as Hotel };
//   }
// };

// /**
//  * Delete a hotel by ID.
//  */
// export const deleteById = async (id: number): Promise<{ status: number }> => {
//   const query = 'DELETE FROM hotels WHERE id = ?';
//   try {
//     await db.run_delete(query, [id]);
//     return { status: 200 };
//   } catch (error) {
//     return { status: 404 };
//   }
// };
import * as db from '../helpers/database';
import { Hotel } from '../schema/hotel';

export const getAll = async (
  limit = 10,
  page = 1,
  search = '',
  location = '',
  minPrice?: number,
  maxPrice?: number
): Promise<Hotel[]> => {
  const offset = (page - 1) * limit;
  let query = 'SELECT id, name, location, price, availability, description, rating FROM hotels WHERE 1=1';
  const values: any[] = [];
  let paramIndex = 1;
  if (search) {
    query += ` AND name ILIKE $${paramIndex++}`;
    values.push(`%${search}%`);
  }
  if (location) {
    query += ` AND location ILIKE $${paramIndex++}`;
    values.push(`%${location}%`);
  }
  if (minPrice !== undefined) {
    query += ` AND price >= $${paramIndex++}`;
    values.push(minPrice);
  }
  if (maxPrice !== undefined) {
    query += ` AND price <= $${paramIndex++}`;
    values.push(maxPrice);
  }
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);
  return await db.run_query<Hotel>(query, values);
};

export const getById = async (id: number): Promise<Hotel | null> => {
  const query = 'SELECT id, name, location, price, availability, description, rating FROM hotels WHERE id = $1';
  const results = await db.run_query<Hotel>(query, [id]);
  return results.length > 0 ? results[0] : null;
};

export const add = async (hotel: Omit<Hotel, 'id'>): Promise<{ status: number; data: number }> => {
  const { name, location, price, availability, description, rating } = hotel;
  const query =
    'INSERT INTO hotels (name, location, price, availability, description, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
  try {
    const result = await db.run_insert<{ id: number }>(query, [
      name,
      location,
      price,
      availability,
      description || null,
      rating || null,
    ]);
    return { status: 201, data: result.id };
  } catch (error) {
    throw new Error(`Failed to add hotel: ${(error as Error).message}`);
  }
};

export const update = async (hotel: Partial<Hotel>, id: number): Promise<{ status: number; data: Hotel }> => {
  const keys = Object.keys(hotel).filter((k) => k !== 'id') as (keyof Omit<Hotel, 'id'>)[];
  if (keys.length === 0) {
    return { status: 400, data: {} as Hotel };
  }
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE hotels SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  const values = [...Object.values(hotel), id];
  try {
    const result = await db.run_update<Hotel>(query, values);
    return result.length > 0 ? { status: 200, data: result[0] } : { status: 404, data: {} as Hotel };
  } catch (error) {
    throw new Error(`Failed to update hotel: ${(error as Error).message}`);
  }
};

export const deleteById = async (id: number): Promise<{ status: number }> => {
  const query = 'DELETE FROM hotels WHERE id = $1';
  try {
    await db.run_delete(query, [id]);
    return { status: 200 };
  } catch (error) {
    throw new Error(`Failed to delete hotel: ${(error as Error).message}`);
  }
};