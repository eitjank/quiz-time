const request = require('supertest');
const app = require('../server');
const Quiz = require('../db/models/Quiz');
const User = require('../db/models/User');
const mongoose = require('mongoose');

describe('Quizzes API', () => {
  let cookie;
  let savedUser;

  beforeAll(async () => {
    await User.deleteMany();

    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'testpassword',
    });
    savedUser = await user.save();

    // Authenticate the test user and get the token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'testpassword' });
    cookie = response.headers['set-cookie'];
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Quiz.deleteMany();
  });

  afterAll(async () => {
    await Quiz.deleteMany({});
    await User.deleteMany({});
    // Close the server
    await new Promise((resolve) => app.close(resolve));

    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  describe('GET /quizzes', () => {
    it('should return all quizzes', async () => {
      // Create some sample quizzes in the database
      await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
      });
      await Quiz.create({
        name: 'Quiz 2',
        description: 'Description 2',
        questions: [],
      });

      const response = await request(app).get('/api/quizzes');

      expect(response.status).toBe(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Quiz 1');
      expect(response.body[1].name).toBe('Quiz 2');
    });
  });

  describe('GET /quizzes/my-quizzes', () => {
    it('should return quizzes created by the authenticated user', async () => {
      await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
        owner: savedUser._id,
      });
      await Quiz.create({
        name: 'Quiz 2',
        description: 'Description 2',
        questions: [],
        owner: savedUser._id,
      });

      const response = await request(app)
        .get('/api/quizzes/my-quizzes')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Quiz 1');
      expect(response.body[1].name).toBe('Quiz 2');
    });

    it('should return 403 if user is not authenticated', async () => {
      const response = await request(app).get('/api/quizzes/my-quizzes');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('GET /quizzes/:id', () => {
    it('should return a single quiz', async () => {
      const createdQuiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
      });

      const response = await request(app).get(
        `/api/quizzes/${createdQuiz._id}`
      );

      expect(response.status).toBe(200);

      expect(response.body.name).toBe('Quiz 1');
      expect(response.body.description).toBe('Description 1');
    });

    it('should return 404 if quiz is not found', async () => {
      const response = await request(app).get(
        '/api/quizzes/65eb92aa68c7c390ecc5be2a'
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if quiz ID is invalid', async () => {
      const response = await request(app).get('/api/quizzes/abcd1234');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /quizzes', () => {
    it('should create a new quiz', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .set('Cookie', cookie)
        .send({
          name: 'New Quiz',
          description: 'New Description',
          questions: [],
        });

      expect(response.status).toBe(201);

      expect(response.body.name).toBe('New Quiz');
      expect(response.body.description).toBe('New Description');
    });
  });

  describe('PUT /quizzes/:id', () => {
    it('should update a quiz', async () => {
      const createdQuiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
        owner: savedUser._id,
      });

      const response = await request(app)
        .put(`/api/quizzes/${createdQuiz._id}`)
        .set('Cookie', cookie)
        .send({
          name: 'Updated Quiz',
          description: 'Updated Description',
          questions: [],
        });

      expect(response.status).toBe(200);

      expect(response.body.name).toBe('Updated Quiz');
      expect(response.body.description).toBe('Updated Description');
    });

    it('should return 404 if quiz is not found', async () => {
      const response = await request(app)
        .put('/api/quizzes/65eb92aa68c7c390ecc5be2a')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
    });

    it('should return 404 if quiz ID is invalid', async () => {
      const response = await request(app)
        .put('/api/quizzes/abcd1234')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('should delete a quiz', async () => {
      const createdQuiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
        owner: savedUser._id,
      });

      const response = await request(app)
        .delete(`/api/quizzes/${createdQuiz._id}`)
        .set('Cookie', cookie);

      expect(response.status).toBe(200);

      expect(response.body.message).toBe('Quiz deleted successfully');
    });

    it('should return 404 if quiz is not found', async () => {
      const response = await request(app)
        .delete('/api/quizzes/65eb92aa68c7c390ecc5be2a')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
    });

    it('should return 404 if quiz ID is invalid', async () => {
      const response = await request(app)
        .delete('/api/quizzes/abcd1234')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /quizzes/:id/export', () => {
    it('should export a quiz', async () => {
      const createdQuiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
        owner: savedUser._id,
      });

      const response = await request(app)
        .get(`/api/quizzes/${createdQuiz._id}/export`)
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename=quiz.json'
      );
    });
    it('should return 404 if quiz is not found', async () => {
      const response = await request(app)
        .get('/api/quizzes/65eb92aa68c7c390ecc5be2a/export')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /quizzes/import', () => {
    it('should import a quiz', async () => {
      const quizData = {
        name: 'Imported Quiz',
        description: 'Imported Description',
        questions: [],
      };

      const response = await request(app)
        .post('/api/quizzes/import')
        .set('Cookie', cookie)
        .send(quizData);

      expect(response.status).toBe(201);

      expect(response.body.message).toBe('Quiz imported successfully');
      expect(response.body.quizId).toBeDefined();
    });

    it('should return 403 if user is not authenticated', async () => {
      const response = await request(app).post('/api/quizzes/import');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });
});
