const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Question = require('./models/Question');

const app = express();
app.use(cors());  // Enable CORS for all routes
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with the URL of your React app
    methods: ["GET", "POST"]
  }
});

// MongoDB connection string
const mongoURI = 'mongodb://127.0.0.1:27017/quizApp'; // localhost instead of 127.0.0.1 does not work

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

let currentQuestionIndex = 0;
let allQuestions = []; // Cache for storing questions from MongoDB

async function loadQuestions() {
  try {
    allQuestions = await Question.find().sort('_id');
    // console.log('Loading questions from cache:', allQuestions)
  } catch (err) {
    console.error('Error loading questions from MongoDB:', err);
  }
};
 
loadQuestions();

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);

  socket.on('requestQuestion', (data) => {
    socket.emit('receiveQuestion', allQuestions[currentQuestionIndex]);
    currentQuestionIndex = (currentQuestionIndex + 1) % allQuestions.length;
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
