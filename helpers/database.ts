import { Sequelize, QueryOptions, QueryTypes } from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false,
});

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

export async function run_query<T>(query: string, values: any[] | Record<string, any>): Promise<T[]> {
  try {
    const options: QueryOptions = {
      replacements: values,
      type: QueryTypes.SELECT,
      raw: true,
    };
    console.log('run_query: Executing query:', query, 'with values:', values);
    const results = await sequelize.query(query, options);
    console.log('run_query: Raw Sequelize results:', results);
    const rows = Array.isArray(results[0]) ? results[0] : results;
    console.log('run_query: Extracted rows:', rows);
    const resultArray = Array.isArray(rows) ? rows : rows ? [rows] : [];
    console.log('run_query: Processed results:', resultArray);
    return resultArray as T[];
  } catch (error) {
    console.error('run_query: Failed:', query, 'Values:', values, 'Error:', error);
    throw error;
  }
}

export async function run_insert<T>(query: string, values: any[] | Record<string, any>): Promise<T> {
  try {
    const options: QueryOptions = { replacements: values, type: QueryTypes.INSERT };
    console.log('run_insert: Query:', query, 'with values:', values);
    const [results] = await sequelize.query(query, options);
    console.log('run_insert: Results:', results);
    return results[0] as T;
  } catch (error) {
    console.error('run_insert: Failed:', query, 'Values:', values, 'Error:', error);
    throw error;
  }
}

export async function run_update<T>(query: string, values: any[] | Record<string, any>): Promise<T[]> {
  try {
    const options: QueryOptions = { replacements: values, type: QueryTypes.UPDATE };
    console.log('run_update: Query:', query, 'with values:', values);
    const [results] = await sequelize.query(query, options);
    console.log('run_update: Results:', results);
    return Array.isArray(results) ? results as T[] : [];
  } catch (error) {
    console.error('run_update: Failed:', query, 'Values:', error);
    throw error;
  }
}

export async function run_delete(query: string, values: any[] | Record<string, any>): Promise<{ rowsAffected: number }> {
  try {
    const options: QueryOptions = { replacements: values, type: QueryTypes.DELETE };
    console.log('run_delete: Original query:', query, 'with values:', values);
    const modifiedQuery = query.trim() + ' RETURNING id';
    console.log('run_delete: Executing query:', modifiedQuery, 'with values:', values);
    const results = await sequelize.query(modifiedQuery, options);
    console.log('run_delete: Raw results:', results);
    const rows = Array.isArray(results[0]) ? results[0] : results;
    const rowsAffected = Array.isArray(rows) ? rows.length : 0;
    console.log('run_delete: Rows affected:', rowsAffected);
    return { rowsAffected };
  } catch (error) {
    console.error('run_delete: Failed:', query, 'Values:', values, 'Error:', error);
    throw error;
  }
}