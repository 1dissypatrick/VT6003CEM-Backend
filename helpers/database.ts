import { Sequelize, QueryOptions } from 'sequelize';
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
      type: 'SELECT',
    };
    console.log('Executing query:', query, 'with values:', values);
    const [results] = await sequelize.query(query, options);
    return (results ?? []) as T[];
  } catch (error) {
    console.error(`Query failed: ${query}`, 'Values:', values, 'Error:', error);
    throw error;
  }
}

export async function run_insert<T>(query: string, values: any[] | Record<string, any>): Promise<T> {
  try {
    const options: QueryOptions = { replacements: values, type: 'INSERT' };
    console.log('Executing insert:', query, 'with values:', values);
    const [results] = await sequelize.query(query, options);
    return results[0] as T;
  } catch (error) {
    console.error(`Insert failed: ${query}`, 'Values:', values, 'Error:', error);
    throw error;
  }
}

export async function run_update<T>(query: string, values: any[] | Record<string, any>): Promise<T[]> {
  try {
    const options: QueryOptions = { replacements: values, type: 'UPDATE' };
    console.log('Executing update:', query, 'with values:', values);
    const [results] = await sequelize.query(query, options);
    return results as T[];
  } catch (error) {
    console.error(`Update failed: ${query}`, 'Values:', values, 'Error:', error);
    throw error;
  }
}

export async function run_delete(query: string, values: any[] | Record<string, any>): Promise<{ rowCount: number }> {
  try {
    const options: QueryOptions = { replacements: values, type: 'DELETE' };
    console.log('Executing delete:', query, 'with values:', values);
    const [, metadata] = await sequelize.query(query, options);
    return { rowCount: (metadata as any).rowCount || 0 };
  } catch (error) {
    console.error(`Delete failed: ${query}`, 'Values:', values, 'Error:', error);
    throw error;
  }
}