const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');

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

let activeQuizzes = {}; // Store active quizzes

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);
  let questionStartTime = Date.now();

  socket.on('requestQuestion', (data) => {
    const quiz = activeQuizzes[data.quizId];
    socket.emit('receiveQuestion', quiz.questions[quiz.currentQuestionIndex]);
  });

  function startQuestionTimer(quizId) {
    questionStartTime = Date.now();
    const quiz = activeQuizzes[quizId];
    console.log(`Moving to question #${quiz.currentQuestionIndex}`);
    io.to(quizId).emit('receiveQuestion', quiz.questions[quiz.currentQuestionIndex]);
  }

  socket.on('joinQuiz', async ({ quizId }) => {
    const quiz = await Quiz.findById(quizId)
    if (activeQuizzes[quizId] || quiz) {

      if (!activeQuizzes[quizId]) {
        activeQuizzes[quizId] = {
          participants: [], questions: quiz.questions, currentQuestionIndex: 0,
          isFinished: false
        };
      }

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
            const allQuestions = activeQuizzes[quizId].questions;
            const quiz = activeQuizzes[quizId];
            const timeRemaining = allQuestions[quiz.currentQuestionIndex]?.timeLimit - timeElapsed;

            if (timeRemaining >= 0) {
              io.to(quizId).emit('timeUpdate', timeRemaining);
            } else {
              // Time's up, move to next question or show results
              questionStartTime = null;
              if (++(quiz.currentQuestionIndex) < allQuestions.length) {
                startQuestionTimer(quizId);
              } else {
                io.to(quizId).emit('quizFinished', { message: "Quiz has finished." });
                // start over the quiz
                // for testing purposes
                quiz.currentQuestionIndex = 0;
                startQuestionTimer(quizId);
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

const routes = require('./routes/quizzes'); // Import the exported router

app.use('/api', routes); // Mount the routes under /api prefix

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
