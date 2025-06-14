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
  let query = 'SELECT id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy FROM hotels WHERE id IS NOT NULL';
  const values: any = {};
  if (search) {
    query += ` AND name ILIKE :search`;
    values.search = `%${search}%`;
  }
  if (location) {
    query += ` AND location ILIKE :location`;
    values.location = `%${location}%`;
  }
  if (minPrice !== undefined) {
    query += ` AND price >= :minPrice`;
    values.minPrice = minPrice;
  }
  if (maxPrice !== undefined) {
    query += ` AND price <= :maxPrice`;
    values.maxPrice = maxPrice;
  }
  query += ` LIMIT :limit OFFSET :offset`;
  values.limit = limit;
  values.offset = offset;
  const results = await db.run_query<Hotel>(query, values);
  console.log('getAll model: Database results:', results);
  return results ?? [];
};

export const getById = async (id: number): Promise<Hotel | null> => {
  const query = 'SELECT id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy FROM hotels WHERE id = :id';
  const results = await db.run_query<Hotel>(query, { id });
  console.log('getById model: Database results for id=', id, ':', results);
  return results.length > 0 ? results[0] : null;
};

export const add = async (hotel: Omit<Hotel, 'id'>): Promise<{ status: number; data: number }> => {
  const { name, location, price, availability, amenities, imageUrl, description, rating, createdBy } = hotel;
  const query =
    'INSERT INTO hotels (name, location, price, availability, amenities, image_url, description, rating, created_by) ' +
    'VALUES (:name, :location, :price, :availability::jsonb, :amenities::jsonb, :imageUrl, :description, :rating, :createdBy) RETURNING id';
  try {
    const result = await db.run_insert<{ id: number }>(query, {
      name,
      location,
      price,
      availability: JSON.stringify(availability),
      amenities: JSON.stringify(amenities),
      imageUrl: imageUrl || null,
      description: description || null,
      rating: rating || null,
      createdBy,
    });
    console.log('add model: Inserted hotel id=', result.id);
    return { status: 201, data: result.id };
  } catch (error) {
    console.error('add model: Error:', error);
    throw new Error(`Failed to add hotel: ${(error as Error).message}`);
  }
};

export const update = async (hotel: Partial<Hotel>, id: number): Promise<{ status: number; data: Hotel }> => {
  const keys = Object.keys(hotel).filter((k) => k !== 'id') as (keyof Omit<Hotel, 'id'>)[];
  if (keys.length === 0) {
    return { status: 400, data: {} as Hotel };
  }
  const keyMap: { [key: string]: string } = {
    imageUrl: 'image_url',
    createdBy: 'created_by',
  };
  const setClause = keys
    .map((key) => {
      const dbKey = keyMap[key] || key;
      return key === 'availability' || key === 'amenities'
        ? `${dbKey} = :${key}::jsonb`
        : `${dbKey} = :${key}`;
    })
    .join(', ');
  const values = keys.reduce((acc, key) => ({
    ...acc,
    [key]: key === 'availability' || key === 'amenities' ? JSON.stringify(hotel[key]) : hotel[key],
  }), { id });
  const query = `UPDATE hotels SET ${setClause} WHERE id = :id RETURNING id, name, location, CAST(price AS FLOAT) AS price, availability, amenities, image_url AS imageUrl, description, CAST(rating AS FLOAT) AS rating, created_by AS createdBy`;
  try {
    const result = await db.run_update<Hotel>(query, values);
    console.log('update model: Updated hotel id=', id, 'result:', result);
    return result.length > 0 ? { status: 200, data: result[0] } : { status: 404, data: {} as Hotel };
  } catch (error) {
    console.error('update model: Error:', error);
    throw new Error(`Failed to update hotel: ${(error as Error).message}`);
  }
};

export const deleteById = async (id: number): Promise<{ status: number }> => {
  const query = 'DELETE FROM hotels WHERE id = :id';
  try {
    const result = await db.run_delete(query, { id });
    console.log('deleteById model: Deleted hotel id=', id, 'rowsAffected:', result.rowsAffected);
    return result.rowsAffected > 0 ? { status: 200 } : { status: 404 };
  } catch (error) {
    console.error('deleteById model: Error:', error);
    throw new Error(`Failed to delete hotel: ${(error as Error).message}`);
  }
};