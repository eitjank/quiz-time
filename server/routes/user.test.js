const request = require('supertest');
const app = require('../server');
const User = require('../db/models/User');
const mongoose = require('mongoose');

describe('User Routes', () => {
  let cookie;

  beforeAll(async () => {
    await User.deleteMany({});
    // Create a test user
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'testpassword',
    });
    await user.save();


    // Authenticate the test user and get the token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'testpassword' });
    cookie = response.headers['set-cookie'];
  });

  afterAll(async () => {
    // Delete the test user
    await User.deleteMany({});

    // Close the server
    await new Promise((resolve) => app.close(resolve));

    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  describe('GET /currentUser', () => {
    it('should return the current user', async () => {
      const response = await request(app)
        .get('/api/user/currentUser')
        .set('Cookie', cookie);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.username).toBe('testuser');
    });

    it('should return 403 Forbidden if user is not authenticated', async () => {
      const response = await request(app).get('/api/user/currentUser');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    // Add more test cases for error scenarios
  });

  describe('PUT /updateUsername', () => {
    it('should update the username', async () => {
      const response = await request(app)
        .put('/api/user/updateUsername')
        .set('Cookie', cookie)
        .send({ username: 'newusername' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Username updated successfully');
      expect(response.body.username).toBe('newusername');
    });

    // Add more test cases for error scenarios
  });

  describe('PUT /changePassword', () => {
    it('should change the password', async () => {
      const response = await request(app)
        .put('/api/user/changePassword')
        .set('Cookie', cookie)
        .send({
          currentPassword: 'testpassword',
          newPassword: 'newpassword',
        });
      expect(response.body.message).toBe('Password changed successfully');
      expect(response.status).toBe(200);
    });

    // Add more test cases for error scenarios
  });

  describe('DELETE /deleteAccount', () => {
    it('should delete the user account', async () => {
      const response = await request(app)
        .delete('/api/user/deleteAccount')
        .set('Cookie', cookie);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account deleted successfully');
    });

    // Add more test cases for error scenarios
  });
});
