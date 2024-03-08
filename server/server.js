const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['*'],
  },
});

const mongoURI = 'mongodb://127.0.0.1:27017/quizApp'; // localhost instead of 127.0.0.1 does not work

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.error(err));

let activeQuizzes = {};

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);

  socket.on('requestQuestion', (data) => {
    const quiz = activeQuizzes[data.quizId];
    socket.emit('receiveQuestion', quiz.questions[quiz.currentQuestionIndex]);
  });

  function startQuestionTimer(quizId) {
    const quiz = activeQuizzes[quizId];
    quiz.currentQuestionStartTime = Date.now();
    console.log(
      `Moving to question #${quiz.currentQuestionIndex} in quiz ${quizId}`
    );
    io.to(quizId).emit(
      'receiveQuestion',
      quiz.questions[quiz.currentQuestionIndex]
    );
  }

  socket.on('joinQuiz', async ({ quizId }) => {
    let quiz = null;
    try {
      quiz = await Quiz.findById(quizId);
    } catch (err) {
      console.error(err);
    }
    if (activeQuizzes[quizId] || quiz) {
      if (!activeQuizzes[quizId]) {
        activeQuizzes[quizId] = {
          participants: [],
          questions: quiz.questions,
          currentQuestionIndex: 0,
          currentQuestionStartTime: null,
          isFinished: false,
        };
      }

      socket.join(quizId);
      console.log(`User ${socket.id} joined quiz ${quizId}`);
      socket.emit('joinedQuiz', {
        success: true,
        quizId,
        message: 'Successfully joined quiz.',
      });

      // Add participant to the quiz
      activeQuizzes[quizId].participants.push(socket.id);

      // Start the quiz timer if it's the first participant
      if (activeQuizzes[quizId].participants.length === 1) {
        activeQuizzes[quizId].currentQuestionStartTime = Date.now();
        console.log(
          `participant length: ${activeQuizzes[quizId].participants.length}`
        );
        setInterval(() => {
          if (
            activeQuizzes[quizId] &&
            activeQuizzes[quizId].currentQuestionStartTime
          ) {
            const quiz = activeQuizzes[quizId];
            const timeElapsed = Math.floor(
              (Date.now() - quiz.currentQuestionStartTime) / 1000
            );
            const allQuestions = activeQuizzes[quizId].questions;
            const timeRemaining =
              allQuestions[quiz.currentQuestionIndex]?.timeLimit - timeElapsed;

            if (timeRemaining >= 0) {
              io.to(quizId).emit('timeUpdate', timeRemaining);
            } else {
              // Time's up, move to next question or show results
              quiz.currentQuestionStartTime = null;
              if (++quiz.currentQuestionIndex < allQuestions.length) {
                startQuestionTimer(quizId);
              } else {
                io.to(quizId).emit('quizFinished', {
                  message: 'Quiz has finished.',
                });
                console.log(`Quiz ${quizId} has finished`);
                // start over the quiz // for testing purposes
                // quiz.currentQuestionIndex = 0;
                // startQuestionTimer(quizId);
              }
            }
          }
        }, 1000); // Update every second
      }
    } else {
      socket.emit('joinedQuiz', { success: false, message: 'Quiz not found.' });
    }
  });

  socket.on('submitAnswer', (data) => {
    const quiz = activeQuizzes[data.quizId];
    const question = quiz.questions[quiz.currentQuestionIndex];
    const participantIndex = quiz.participants.indexOf(socket.id);
    if (participantIndex !== -1) {
      if (!question.answers) {
        question.answers = [];
      }
      question.answers.push({
        participantId: socket.id,
        answer: data.answer,
      });
      if (data.answer === question.answer) {
        console.log(`User ${socket.id} answered correctly`);
      } else {
        console.log(`User ${socket.id} answered incorrectly`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected with ID: ${socket.id}`);
    for (const quizId in activeQuizzes) {
      const quiz = activeQuizzes[quizId];
      const participantIndex = quiz.participants.indexOf(socket.id);
      if (participantIndex !== -1) {
        quiz.participants.splice(participantIndex, 1);
        console.log(`User ${socket.id} left quiz ${quizId}`);
        if (quiz.participants.length === 0) {
          delete activeQuizzes[quizId];
          console.log(`Active quiz ${quizId} deleted`);
        }
      }
    }
  });
});

const routes = require('./routes/quizzes');

app.use('/api', routes); // Mount the routes under /api prefix

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
