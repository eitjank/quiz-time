const request = require('supertest');
const app = require('../server');
const Question = require('../db/models/Question');
const User = require('../db/models/User');
const mongoose = require('mongoose');

describe('Question Routes', () => {
  let cookie;

  beforeAll(async () => {
    await Question.deleteMany({});
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

  describe('GET /questionsImportExport', () => {
    it('should return the questions owned by the user', async () => {
      const response = await request(app)
        .get('/api/questionsImportExport')
        .set('Cookie', cookie);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 403 Forbidden if user is not authenticated', async () => {
      const response = await request(app).get('/api/questionsImportExport');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    // Add more test cases for error scenarios
  });

  describe('POST /questionsImportExport', () => {
    it('should import new questions', async () => {
      const response = await request(app)
        .post('/api/questionsImportExport')
        .set('Cookie', cookie)
        .send([
          { type: 'openEnded', question: 'Question 1', answer: 'Answer 1' },
          { type: 'openEnded', question: 'Question 2', answer: 'Answer 2' },
        ]);
      expect(response.status).toBe(201);
      expect(response.body.length).toBe(2);
      expect(response.body[0].question).toBe('Question 1');
      expect(response.body[0].answer).toBe('Answer 1');
      expect(response.body[1].question).toBe('Question 2');
      expect(response.body[1].answer).toBe('Answer 2');
    });

    it('should return 403 Forbidden if user is not authenticated', async () => {
      const response = await request(app).post('/api/questionsImportExport');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should return 500 if there is an error in the server', async () => {
      const response = await request(app)
        .post('/api/questionsImportExport')
        .set('Cookie', cookie);
      expect(response.status).toBe(500);
    });
  });
});
