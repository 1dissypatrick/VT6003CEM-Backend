import * as db from '../helpers/database';
import { User } from '../schema/user.schema';

export const getAll = async (limit: number = 20, page: number = 1): Promise<User[]> => {
  const offset = (page - 1) * limit;
  const query = 'SELECT id, username, email, role, avatarurl FROM users LIMIT :limit OFFSET :offset';
  const results = await db.run_query<User>(query, { limit: limit.toString(), offset: offset.toString() });
  return results ?? [];
};

export const getSearch = async (fields: string | string[], search: string): Promise<User[]> => {
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  const validFields = fieldArray.filter((f) => ['username', 'email', 'role'].includes(f));
  if (!validFields.length) return [];
  const conditions = validFields.map((f) => `${f} ILIKE :search`).join(' OR ');
  const query = `SELECT id, username, email, role, avatarurl FROM users WHERE ${conditions}`;
  const results = await db.run_query<User>(query, { search: `%${search}%` });
  return results ?? [];
};

export const getByUserId = async (id: number): Promise<User | null> => {
  const query = 'SELECT id, username, email, role, avatarurl FROM users WHERE id = :id';
  const results = await db.run_query<User>(query, { id: id.toString() });
  return results.length > 0 ? results[0] : null;
};

export const findByUsername = async (username: string): Promise<User[]> => {
  const query = 'SELECT id, username, password, email, role, avatarurl FROM users WHERE username = :username';
  const result = await db.run_query<User>(query, { username });
  return Array.isArray(result) ? result : [result].filter(Boolean) as User[];
};

export const getByEmail = async (email: string): Promise<User[]> => {
  const query = 'SELECT id, username, password, email, role, avatarurl FROM users WHERE email = :email';
  const results = await db.run_query<User>(query, { email });
  return results ?? [];
};

export const add = async (user: Omit<User, 'id'> & { signupCode?: string | null }): Promise<number> => {
  const { username, password, email, role, avatarurl, signupCode } = user;
  console.log('Received signupCode:', signupCode);
  if (!username || !password || !email || !role) {
    throw new Error('Missing required fields');
  }
  const existingUsers = await findByUsername(username);
  const existingEmails = await getByEmail(email);
  if (existingUsers.length > 0 || existingEmails.length > 0) {
    throw new Error('User already exists');
  }
  console.log('Using provided hash for', username, ':', password);
  const query =
    'INSERT INTO users (username, password, email, role, avatarurl, signupcode) VALUES (:username, :password, :email, :role, :avatarurl, :signupcode) RETURNING id';
  try {
    const result = await db.run_insert<{ id: number }>(query, {
      username,
      password: password || '',
      email,
      role,
      avatarurl: avatarurl || null,
      signupcode: signupCode || null,
    });
    console.log('User inserted with ID:', result.id);
    return result.id;
  } catch (error) {
    console.error('Insert error:', error);
    throw new Error(`Failed to add user: ${(error as Error).message}`);
  }
};

export const update = async (user: Partial<User>, id: number): Promise<{ status: number }> => {
  const keys = Object.keys(user).filter((k) => k !== 'id') as (keyof Omit<User, 'id'>)[];
  if (keys.length === 0) return { status: 400 };
  const setClause = keys.map((key) => `${key} = :${key}`).join(', ');
  const values = keys.reduce((acc, key) => ({ ...acc, [key]: user[key] }), { id: id.toString() });
  const query = `UPDATE users SET ${setClause} WHERE id = :id`;
  try {
    await db.run_update(query, values);
    return { status: 201 };
  } catch (error) {
    throw new Error(`Failed to update user: ${(error as Error).message}`);
  }
};

export const deleteById = async (id: number): Promise<{ affectedRows: number }> => {
  const query = 'DELETE FROM users WHERE id = :id';
  try {
    const result = await db.run_delete(query, { id: id.toString() });
    return { affectedRows: result.rowsAffected };
  } catch (error) {
    throw new Error(`Failed to delete user: ${(error as Error).message}`);
  }
};