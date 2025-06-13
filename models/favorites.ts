import * as db from '../helpers/database';
import { Favorite } from '../schema/favorite.schema';

export const add = async (userId: number, hotelId: number): Promise<Favorite> => {
  const hotelQuery = 'SELECT id, name FROM hotels WHERE id = :hotelId';
  const hotels = await db.run_query<{ id: number; name: string }>(hotelQuery, { hotelId: hotelId.toString() });
  if (!hotels.length) {
    throw new Error('Hotel not found');
  }
  const hotelName = hotels[0].name;
  const existingQuery = 'SELECT id FROM favorites WHERE user_id = :userId AND hotel_id = :hotelId';
  const existing = await db.run_query(existingQuery, { userId: userId.toString(), hotelId: hotelId.toString() });
  if (existing.length) {
    throw new Error('Hotel already favorited');
  }
  const query =
    'INSERT INTO favorites (user_id, hotel_id, hotel_name) VALUES (:userId, :hotelId, :hotelName) ' +
    'RETURNING id, user_id AS "userId", hotel_id AS "hotelId", hotel_name AS "hotelName", created_at AS "createdAt"';
  try {
    const result = await db.run_insert<Favorite>(query, {
      userId: userId.toString(),
      hotelId: hotelId.toString(),
      hotelName,
    });
    console.log('add: Inserted favorite:', result);
    return result;
  } catch (error) {
    console.error('add: Error:', error);
    throw new Error(`Failed to add favorite: ${(error as Error).message}`);
  }
};

export const getByUserId = async (userId: number): Promise<Favorite[]> => {
  const query =
    'SELECT id, user_id AS "userId", hotel_id AS "hotelId", hotel_name AS "hotelName", created_at AS "createdAt" ' +
    'FROM favorites WHERE user_id = :userId ORDER BY created_at DESC';
  try {
    const results = await db.run_query<Favorite>(query, { userId: userId.toString() });
    console.log('getByUserId: Retrieved favorites for userId=', userId, ':', results);
    return results ?? [];
  } catch (error) {
    console.error('getByUserId: Error:', error);
    throw new Error(`Failed to retrieve favorites: ${(error as Error).message}`);
  }
};

export const remove = async (userId: number, hotelId: number): Promise<{ rowsAffected: number }> => {
  const query = 'DELETE FROM favorites WHERE user_id = :userId AND hotel_id = :hotelId';
  try {
    const result = await db.run_delete(query, { userId: userId.toString(), hotelId: hotelId.toString() });
    console.log('remove: Deleted favorite for userId=', userId, 'hotelId=', hotelId, 'rowsAffected:', result.rowsAffected);
    return result;
  } catch (error) {
    console.error('remove: Error:', error);
    throw new Error(`Failed to remove favorite: ${(error as Error).message}`);
  }
};