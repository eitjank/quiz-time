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
  { question: 'What is the capital of France?', answer: 'Paris' },
  { question: 'What is 2 + 2?', answer: '4' },
  { question: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare' },
  { question: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
  { question: 'What is the chemical symbol for water?', answer: 'H2O' },
  { question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci' },
  { question: 'In what year did the Titanic sink?', answer: '1912' },
  { question: 'Which element has the atomic number 1?', answer: 'Hydrogen' },
  { question: 'What is the capital city of Japan?', answer: 'Tokyo' },
  { question: 'Who is known as the father of computers?', answer: 'Charles Babbage' },
  { question: 'What is the largest country in the world?', answer: 'Russia' },
  { question: 'How many continents are there on Earth?', answer: '7' },
  { question: 'What is the main ingredient in sushi?', answer: 'Rice' },
  { question: 'What is the fastest land animal?', answer: 'Cheetah' },
  { question: 'Who is the author of the "Harry Potter" series?', answer: 'J.K. Rowling' },
  // Add more questions as needed
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
