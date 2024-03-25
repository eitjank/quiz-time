const mongoose = require('mongoose');
const Quiz = require('./db/models/Quiz');
const User = require('./db/models/User');

const db = 'mongodb://127.0.0.1:27017/quizApp';

mongoose.connect(db);

const questions1 = [
  {
    type: 'multipleChoice',
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '22'],
    answer: '4',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Jupiter', 'Saturn', 'Mars'],
    answer: 'Jupiter',
    timeLimit: 10,
  },
  {
    type: 'trueFalse',
    question: 'The earth is flat.',
    answer: 'False',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'Who wrote the novel "1984"?',
    options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Isaac Asimov'],
    answer: 'George Orwell',
    timeLimit: 10,
  },
  {
    type: 'trueFalse',
    question: 'The programming language Python is named after the snake.',
    answer: 'False',
    timeLimit: 10,
  },
  {
    type: 'openEnded',
    question: 'What is the square root of 144?',
    answer: '12',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    answer: 'Canberra',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'Who directed the movie "Inception"?',
    options: [
      'Christopher Nolan',
      'Steven Spielberg',
      'James Cameron',
      'Martin Scorsese',
    ],
    answer: 'Christopher Nolan',
    timeLimit: 10,
  },
  {
    type: 'openEnded',
    question: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    timeLimit: 10,
  },
];

const questions2 = [
  {
    type: 'multipleChoice',
    question: 'What is the capital of the United States?',
    options: ['New York', 'Washington D.C.', 'Los Angeles', 'Chicago'],
    answer: 'Washington D.C.',
    timeLimit: 10,
  },
  {
    type: 'multipleChoice',
    question: 'What is the largest ocean in the world?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 'Pacific',
    timeLimit: 10,
  },
];

const addInitialDataToDB = async () => {
  try {
    const user = new User({
      email: 'test@test',
      password: 'test',
      username: 'test',
    });

    await user.save();

    const quiz = new Quiz({
      name: 'My Quiz',
      description: 'A quiz about various topics',
      questions: questions1,
      visibility: 'public',
      owner: user._id,
    });

    await quiz.save();

    const quiz2 = new Quiz({
      name: 'Another Quiz',
      description: 'Another quiz about various topics',
      questions: questions2,
      visibility: 'private',
      owner: user._id,
    });

    await quiz2.save();

    console.log('Quizzes have been created.');
  } catch (err) {
    console.error('Failed to add questions and quizzes to the database:', err);
  } finally {
    mongoose.disconnect();
  }
};

addInitialDataToDB();
