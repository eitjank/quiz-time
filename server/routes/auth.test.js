const request = require('supertest');
const app = require('../server');
const User = require('../db/models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany();
  });

  afterAll(async () => {
    // Close the server
    await new Promise((resolve) => app.close(resolve));

    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  describe('POST /signup', () => {
    it('should create a new user and return a token', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User signed in successfully');
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.createdAt).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return an error if user already exists', async () => {
      // Create a user in the database
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /login', () => {
    it('should log in a user and return a token', async () => {
      // Create a user in the database
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User logged in successfully');
      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return an error if email or password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: '',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return an error if email or password is incorrect', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'incorrectpassword',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Incorrect password or email');
    });
  });

  describe('POST /logout', () => {
    it('should log out a user', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /userVerification', () => {
    it('should return status true and user details if token is valid', async () => {
      // Create a user in the database
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      // Generate a valid token
      const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY);

      const response = await request(app)
        .post('/api/auth')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.user).toBe('testuser');
    });

    it('should return status false if token is missing', async () => {
      const response = await request(app).post('/api/auth');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(false);
    });

    it('should return status false if token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth')
        .set('Cookie', 'token=invalidtoken');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(false);
    });
  });
});
