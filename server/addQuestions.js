const mongoose = require('mongoose');
const Question = require('./models/Question'); // Update the path to your Question model

// MongoDB connection string
const db = 'mongodb://127.0.0.1:27017/quizApp'; // Update with your connection string

mongoose.connect(db)

const questions = [
    {
        type: 'multipleChoice',
        question: 'What is the capital of France?',
        options: ['Paris', 'London', 'Berlin', 'Madrid'],
        answer: 'Paris',
        timeLimit: 10
      },
      {
        type: 'multipleChoice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
        timeLimit: 10
      },
      {
        type: 'multipleChoice',
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Jupiter', 'Saturn', 'Mars'],
        answer: 'Jupiter',
        timeLimit: 10
      },
      {
        type: 'openEnded',
        question: 'Name the author of "To Kill a Mockingbird".',
        answer: 'Harper Lee',
        timeLimit: 10
      },
      {
        type: 'openEnded',
        question: 'What is the chemical symbol for the element oxygen?',
        answer: 'O',
        timeLimit: 10
      },
      {
        type: 'trueFalse',
        question: 'The earth is flat.',
        answer: 'False',
        timeLimit: 10
      },
      {
        type: 'trueFalse',
        question: 'The sun is a star.',
        answer: 'True', 
        timeLimit: 10
      }
];

const addQuestionsToDB = async () => {
  try {
    for (const question of questions) {
      const newQuestion = new Question(question);
      await newQuestion.save();
    }
    console.log('All questions have been added to the database.');
  } catch (err) {
    console.error('Failed to add questions to the database:', err);
  } finally {
    mongoose.disconnect();
  }
};

addQuestionsToDB();
