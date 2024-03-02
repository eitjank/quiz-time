const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Question = require('./models/Question');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());  // Enable CORS for all routes
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with the URL of your React app
    methods: ["GET", "POST"]
  }
});

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

let activeQuizzes = {}; // Store active quizzes

// Function to simulate quiz creation
function createQuiz() {
  const quizId = uuidv4();
  activeQuizzes[quizId] = {
    participants: [], questions: [], currentQuestionIndex: 0,
    isFinished: false
  };
  return quizId;
}

// Create a sample quiz on server start
const sampleQuizId = createQuiz();
console.log(`Sample Quiz ID: ${sampleQuizId}`); // Use this ID to test joining

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);
  let questionStartTime = Date.now();

  socket.on('requestQuestion', (data) => {
    socket.emit('receiveQuestion', allQuestions[currentQuestionIndex]);
  });

  function startQuestionTimer() {
    questionStartTime = Date.now();
    console.log(`Moving to question #${currentQuestionIndex}`);
    io.to(sampleQuizId).emit('receiveQuestion', allQuestions[currentQuestionIndex]);
  }

  socket.on('joinQuiz', ({ quizId }) => {
    // const activeQuiz = ActiveQuiz.findById(quizId);
    // if (activeQuiz) {
    if (activeQuizzes[quizId]) {
      socket.join(quizId);
      console.log(`User ${socket.id} joined quiz ${quizId}`);
      socket.emit('joinedQuiz', { success: true, quizId, message: "Successfully joined quiz." });

      // Add participant to the quiz
      activeQuizzes[quizId].participants.push(socket.id);

      questionStartTime = Date.now();
      // Start the quiz timer if it's the first participant
      if (activeQuizzes[quizId].participants.length === 1) {
        console.log(activeQuizzes[quizId].participants.length);
        setInterval(() => {
          if (questionStartTime) {
            const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
            const timeRemaining = allQuestions[currentQuestionIndex]?.timeLimit - timeElapsed;

            if (timeRemaining >= 0) {
              io.to(sampleQuizId).emit('timeUpdate', timeRemaining);
            } else {
              // Time's up, move to next question or show results
              questionStartTime = null;
              if (++currentQuestionIndex < allQuestions.length) {
                startQuestionTimer();
              } else {
                io.to(sampleQuizId).emit('quizFinished', { message: "Quiz has finished." });
                // start over the quiz
                // for testing purposes
                currentQuestionIndex = 0;
                startQuestionTimer();
              }
            }
          }
        }, 1000); // Update every second
      }

    } else {
      socket.emit('joinedQuiz', { success: false, message: "Quiz not found." });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
