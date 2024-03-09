const request = require('supertest');
const app = require('../server');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
const mongoose = require('mongoose');

describe('Quiz Sessions API', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await QuizSession.deleteMany();
    await Quiz.deleteMany();
  });

  afterAll(async () => {
    // Close the server
    await new Promise((resolve) => app.close(resolve));

    await mongoose.connection.close();
  });

  describe('POST /quizsessions/start', () => {
    it('should start a new quiz session', async () => {
      // Create a quiz in the database
      const quiz = await Quiz.create({
        name: 'Quiz 1',
        description: 'Description 1',
        questions: [],
      });

      const response = await request(app)
        .post('/api/quizsessions/start')
        .send({ quizId: quiz._id });

      expect(response.status).toBe(200);
      expect(response.body.quizSessionId).toBeDefined();

      const quizSession = await QuizSession.findById(
        response.body.quizSessionId
      );
      expect(quizSession).toBeDefined();
      expect(quizSession.quiz.toString()).toBe(quiz._id.toString());
    });

    it('should return 404 if quiz is not found', async () => {
      const response = await request(app)
        .post('/api/quizsessions/start')
        .send({ quizId: '65eb92aa68c7c390ecc5be2a' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Quiz not found');
    });
  });
});
