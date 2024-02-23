const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());  // Enable CORS for all routes
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with the URL of your React app
    methods: ["GET", "POST"]
  }
});

const quizQuestions = [
  {
    type: 'multipleChoice',
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris',
  },
  {
    type: 'multipleChoice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    answer: '4',
  },
  {
    type: 'multipleChoice',
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Jupiter', 'Saturn', 'Mars'],
    answer: 'Jupiter',
  },
  {
    type: 'openEnded',
    question: 'Name the author of "To Kill a Mockingbird".',
    answer: 'Harper Lee',
  },
  {
    type: 'openEnded',
    question: 'What is the chemical symbol for the element oxygen?',
    answer: 'O',
  },
  {
    type: 'trueFalse',
    question: 'The earth is flat.',
    answer: 'False',
  },
  {
    type: 'trueFalse',
    question: 'The sun is a star.',
    answer: 'True',
  }
  // Add more questions with various types
];

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('requestQuestion', (data) => {
    // Send a random quiz question to the client
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    socket.emit('receiveQuestion', randomQuestion);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
