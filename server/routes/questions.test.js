const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Question = require('../db/models/Question');
const User = require('../db/models/User');

describe('Question Routes', () => {
  let savedUser;
  let cookie;

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

  afterAll(async () => {
    await User.deleteMany();
    await Question.deleteMany();
    // Close the server
    await new Promise((resolve) => app.close(resolve));
    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the Question collection before each test
    await Question.deleteMany();
  });

  describe('GET /questions', () => {
    it('should get all questions', async () => {
      // Create some sample questions in the database

      const questions = await Question.create([
        {
          type: 'multiple-choice',
          question: 'Question 1',
          answer: 'Answer 1',
          owner: savedUser._id,
        },
        {
          type: 'multiple-choice',
          question: 'Question 2',
          answer: 'Answer 2',
          owner: savedUser._id,
        },
        {
          type: 'multiple-choice',
          question: 'Question 3',
          answer: 'Answer 3',
          owner: savedUser._id,
        },
      ]);

      const response = await request(app)
        .get('/api/questions')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].question).toBe(questions[0].question);
      expect(response.body[1].question).toBe(questions[1].question);
      expect(response.body[2].question).toBe(questions[2].question);
    });

    // Add more test cases for error scenarios
  });

  describe('GET /questions/:id', () => {
    it('should get a question by ID', async () => {
      // Create a sample question in the database
      const question = await Question.create({
        type: 'multiple-choice',
        question: 'Sample Question',
        answer: 'Sample Answer',
        owner: savedUser._id,
      });

      const response = await request(app)
        .get(`/api/questions/${question._id}`)
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.question).toBe(question.question);
    });

    it('should return an error if the question does not exist', async () => {
      const response = await request(app)
        .get('/api/questions/nonexistent-id')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Question not found');
    });

    // Add more test cases for error scenarios
  });

  describe('POST /questions', () => {
    it('should create a new question', async () => {
      const questionObj = {
        type: 'multiple-choice',
        question: 'New Question',
        answer: 'New Answer',
        owner: savedUser._id,
      };
      const response = await request(app)
        .post('/api/questions')
        .send(questionObj)
        .set('Cookie', cookie);

      expect(response.status).toBe(201);
      expect(response.body.question).toBe(questionObj.question);

      // Check if the question is saved in the database
      const question = await Question.findById(response.body._id);
      expect(question).toBeDefined();
      expect(question.question).toBe(questionObj.question);
    });

    // Add more test cases for error scenarios
  });

  describe('PUT /questions/:id', () => {
    it('should update a question', async () => {
      // Create a sample question in the database
      const question = await Question.create({
        type: 'multiple-choice',
        question: 'Sample Question',
        answer: 'Sample Answer',
        owner: savedUser._id,
      });

      const response = await request(app)
        .put(`/api/questions/${question._id}`)
        .set('Cookie', cookie)
        .send({ question: 'Updated Question' });

      expect(response.status).toBe(200);
      expect(response.body.question).toBe('Updated Question');

      // Check if the question is updated in the database
      const updatedQuestion = await Question.findById(question._id);
      expect(updatedQuestion.question).toBe('Updated Question');
    });

    it('should return an error if the question does not exist', async () => {
      const response = await request(app)
        .put('/api/questions/nonexistent-id')
        .set('Cookie', cookie)
        .send({ question: 'Updated Question' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Question not found');
    });

    // Add more test cases for error scenarios
  });

  describe('DELETE /questions/:id', () => {
    it('should delete a question', async () => {
      // Create a sample question in the database
      const question = await Question.create({
        type: 'multiple-choice',
        question: 'Sample Question',
        answer: 'Sample Answer',
        owner: savedUser._id,
      });

      const response = await request(app)
        .delete(`/api/questions/${question._id}`)
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Deleted Question');

      // Check if the question is deleted from the database
      const deletedQuestion = await Question.findById(question._id);
      expect(deletedQuestion).toBeNull();
    });

    it('should return an error if the question does not exist', async () => {
      const response = await request(app)
        .delete('/api/questions/nonexistent-id')
        .set('Cookie', cookie);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Question not found');
    });

    // Add more test cases for error scenarios
  });
});
