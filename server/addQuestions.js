const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');

const db = 'mongodb://127.0.0.1:27017/quizApp';

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
    type: 'trueFalse',
    question: 'The earth is flat.',
    answer: 'False',
    timeLimit: 10
  },
  {
    type: 'multipleChoice',
    question: 'Who wrote the novel "1984"?',
    options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Isaac Asimov'],
    answer: 'George Orwell',
    timeLimit: 10
  },
  {
    type: 'trueFalse',
    question: 'The programming language Python is named after the snake.',
    answer: 'False',
    timeLimit: 10
  },
  {
    type: 'openEnded',
    question: 'What is the square root of 144?',
    answer: '12',
    timeLimit: 10
  },
  {
    type: 'multipleChoice',
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    answer: 'Canberra',
    timeLimit: 10
  },
  {
    type: 'multipleChoice',
    question: 'Who directed the movie "Inception"?',
    options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Martin Scorsese'],
    answer: 'Christopher Nolan',
    timeLimit: 10
  },
  {
    type: 'openEnded',
    question: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    timeLimit: 10
  },
];

const addQuestionsToDB = async () => {
  try {
    const quiz = new Quiz({
      name: 'My Quiz',
      description: 'A quiz about various topics',
      questions: questions
    });

    await quiz.save();

    console.log('A new quiz with embedded questions has been created.');
  } catch (err) {
    console.error('Failed to add questions and quiz to the database:', err);
  } finally {
    mongoose.disconnect();
  }
};

addQuestionsToDB();
