const request = require('supertest');
const app = require('../server');
const Quiz = require('../db/models/Quiz');
const mongoose = require('mongoose');

describe('Quizzes API', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Quiz.deleteMany();
  });

  afterAll(async () => {
    await Quiz.deleteMany({});
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

      // Make a GET request to /quizzes
      const response = await request(app).get('/api/quizzes');

      expect(response.status).toBe(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Quiz 1');
      expect(response.body[1].name).toBe('Quiz 2');
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
      const response = await request(app).post('/api/quizzes').send({
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
      });

      const response = await request(app)
        .put(`/api/quizzes/${createdQuiz._id}`)
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
      const response = await request(app).put(
        '/api/quizzes/65eb92aa68c7c390ecc5be2a'
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if quiz ID is invalid', async () => {
      const response = await request(app).put('/api/quizzes/abcd1234');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('should delete a quiz', async () => {
      const createdQuiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
      });

      const response = await request(app).delete(
        `/api/quizzes/${createdQuiz._id}`
      );

      expect(response.status).toBe(200);

      expect(response.body.message).toBe('Quiz deleted successfully');
    });

    it('should return 404 if quiz is not found', async () => {
      const response = await request(app).delete(
        '/api/quizzes/65eb92aa68c7c390ecc5be2a'
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if quiz ID is invalid', async () => {
      const response = await request(app).delete('/api/quizzes/abcd1234');

      expect(response.status).toBe(404);
    });
  });
});
