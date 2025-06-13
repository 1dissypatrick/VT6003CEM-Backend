import * as db from '../helpers/database';
import { Message } from '../schema/message.schema';

export const add = async (senderId: number, recipientId: number, hotelId: number | null, content: string): Promise<Message> => {
  if (!senderId || isNaN(senderId)) {
    throw new Error('Invalid sender ID');
  }
  if (!recipientId || isNaN(recipientId)) {
    throw new Error('Invalid recipient ID');
  }
  const userQuery = 'SELECT id, role FROM users WHERE id = :recipientId';
  const users = await db.run_query<{ id: number; role: string }>(userQuery, { recipientId: recipientId.toString() });
  if (!users.length || users[0].role !== 'operator') {
    throw new Error('Recipient must be an operator');
  }
  if (hotelId) {
    const hotelQuery = 'SELECT id FROM hotels WHERE id = :hotelId';
    const hotels = await db.run_query<{ id: number }>(hotelQuery, { hotelId: hotelId.toString() });
    if (!hotels.length) {
      throw new Error('Hotel not found');
    }
  }
  const query =
    'INSERT INTO messages (sender_id, recipient_id, hotel_id, content) ' +
    'VALUES (:senderId, :recipientId, :hotelId, :content) ' +
    'RETURNING id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt"';
  try {
    const result = await db.run_insert<Message>(query, {
      senderId: String(senderId),
      recipientId: String(recipientId),
      hotelId: hotelId ? String(hotelId) : null,
      content,
    });
    console.log('add: Inserted message:', result);
    return result;
  } catch (error) {
    console.error('add: Error:', error);
    throw new Error(`Failed to send message: ${(error as Error).message}`);
  }
};

export const getByUserId = async (userId: number): Promise<Message[]> => {
  const query =
    'SELECT id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt" ' +
    'FROM messages WHERE sender_id = :userId OR recipient_id = :userId ORDER BY sent_at DESC';
  try {
    const results = await db.run_query<Message>(query, { userId: String(userId) });
    console.log('getByUserId: Retrieved messages for userId=', userId, ':', results);
    return results ?? [];
  } catch (error) {
    console.error('getByUserId: Error:', error);
    throw new Error(`Failed to retrieve messages: ${(error as Error).message}`);
  }
};

export const respond = async (messageId: number, response: string, operatorId: number): Promise<Message> => {
  const query =
    'UPDATE messages SET response = :response WHERE id = :messageId AND recipient_id = :operatorId ' +
    'RETURNING id, sender_id AS "senderId", recipient_id AS "recipientId", hotel_id AS "hotelId", content, response, sent_at AS "sentAt"';
  try {
    const results = await db.run_update<Message>(query, {
      messageId: String(messageId),
      response,
      operatorId: String(operatorId),
    });
    if (!results || results.length === 0) {
      throw new Error('Message not found or unauthorized');
    }
    const result = results[0];
    console.log('respond: Updated messageId=', messageId, ':', result);
    return result;
  } catch (error) {
    console.error('respond: Error:', error);
    throw new Error(`Failed to respond to message: ${(error as Error).message}`);
  }
};

export const remove = async (messageId: number, operatorId: number): Promise<{ rowsAffected: number }> => {
  const query =
    'DELETE FROM messages WHERE id = :messageId AND (sender_id = :operatorId OR recipient_id = :operatorId)';
  try {
    const result = await db.run_delete(query, { messageId: String(messageId), operatorId: String(operatorId) });
    console.log('remove: Deleted messageId=', messageId, 'for operatorId=', operatorId, 'rowsAffected:', result.rowsAffected);
    return result;
  } catch (error) {
    console.error('remove: Error:', error);
    throw new Error(`Failed to delete message: ${(error as Error).message}`);
  }
};