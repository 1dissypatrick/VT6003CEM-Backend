"use strict";
// import supertest from 'supertest';
// import { sequelize } from '../helpers/database';
// import * as hotelModel from '../models/hotels';
// import * as userModel from '../models/users';
// import app from '../index';
// import jwt from 'jsonwebtoken';
// const request = supertest(app.callback());
// const JWT_SECRET = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';
// describe('Hotel API', () => {
//   beforeAll(async () => {
//     await sequelize.authenticate();
//     await sequelize.query(
//       'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), role VARCHAR(50), avatarurl VARCHAR(255))'
//     );
//     await sequelize.query(
//       'CREATE TABLE IF NOT EXISTS hotels (id SERIAL PRIMARY KEY, name VARCHAR(255), location VARCHAR(255), price FLOAT, availability BOOLEAN, description TEXT, rating FLOAT)'
//     );
//     await userModel.add({
//       username: 'testoperator',
//       password: await import('bcrypt').then((bcrypt) => bcrypt.hashSync('password123', 10)),
//       email: 'test@operator.com',
//       role: 'operator',
//       avatarurl: '',
//       signupCode: 'WANDERLUST2025',
//     });
//   });
//   afterAll(async () => {
//     await sequelize.query('DROP TABLE IF EXISTS hotels');
//     await sequelize.query('DROP TABLE IF EXISTS users');
//     await sequelize.close();
//   });
//   it('should list hotels without authentication', async () => {
//     await hotelModel.add({ name: 'Test Hotel', location: 'Paris', price: 100, availability: true });
//     const res = await request.get('/api/v1/hotels');
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveLength(1);
//     expect(res.body[0].name).toBe('Test Hotel');
//     expect(res.body[0].availability).toBe(true);
//   });
//   it('should create a hotel with valid token', async () => {
//     const token = jwt.sign({ username: 'testoperator', role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
//     const res = await request
//       .post('/api/v1/hotels')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ name: 'New Hotel', location: 'London', price: 150, availability: true });
//     expect(res.status).toBe(201);
//     expect(res.body).toHaveProperty('id');
//   });
//   it('should not create a hotel without token', async () => {
//     const res = await request
//       .post('/api/v1/hotels')
//       .send({ name: 'New Hotel', location: 'London', price: 150, availability: true });
//     expect(res.status).toBe(401);
//     expect(res.body).toHaveProperty('error', 'Invalid token');
//   });
//   it('should not create a hotel with invalid data', async () => {
//     const token = jwt.sign({ username: 'testoperator', role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
//     const res = await request
//       .post('/api/v1/hotels')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ name: '', location: 'London', price: -10, availability: true });
//     expect(res.status).toBe(400);
//     expect(res.body).toHaveProperty('error');
//   });
// });
