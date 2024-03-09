const socketIo = require('socket.io');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
require('dotenv').config();

let activeQuizzes = {};

function socketSetup(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['*'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected with ID: ${socket.id}`);

    socket.on('requestQuestion', (data) => {
      const quiz = activeQuizzes[data.quizSessionId];
      socket.emit('receiveQuestion', quiz.questions[quiz.currentQuestionIndex]);
    });

    function startQuestionTimer(quizSessionId) {
      const quiz = activeQuizzes[quizSessionId];
      quiz.currentQuestionStartTime = Date.now();
      console.log(
        `Moving to question #${quiz.currentQuestionIndex} in quiz ${quizSessionId}`
      );
      io.to(quizSessionId).emit(
        'receiveQuestion',
        quiz.questions[quiz.currentQuestionIndex]
      );
    }

    socket.on('hostJoinQuiz', async ({ quizSessionId }) => {
      const quizSession = await QuizSession.findById(quizSessionId);
      const quiz = await Quiz.findById(quizSession.quiz); // get quiz from quizSession
      activeQuizzes[quizSessionId] = {
        participants: [],
        host: socket.id,
        questions: quiz.questions,
        currentQuestionIndex: 0,
        currentQuestionStartTime: null,
        isFinished: false,
      };
      console.log(`Host ${socket.id} joined quiz ${quizSessionId}`);
      socket.join(quizSessionId);
      socket.emit('joinedQuiz', {
        success: true,
        quizSessionId: quizSessionId,
        message: 'Successfully joined quiz.',
      });
    });

    socket.on('joinQuiz', async ({ quizSessionId }) => {
      const quizSession = await QuizSession.findById(quizSessionId);
      quizSession.participants.push(socket.id);
      await quizSession.save();
      const quiz = await Quiz.findById(quizSession.quiz); // get quiz from quizSession

      if (activeQuizzes[quizSessionId]) {
        socket.join(quizSessionId);
        console.log(`User ${socket.id} joined quiz ${quizSessionId}`);
        socket.emit('joinedQuiz', {
          success: true,
          quizSessionId: quizSessionId,
          message: 'Successfully joined quiz.',
        });

        // Add participant to the quiz
        activeQuizzes[quizSessionId].participants.push(socket.id);
        // Notify the host that a participant has joined
        io.to(quizSessionId).emit('participantJoined', {
          participantId: socket.id,
        });
      } else {
        socket.emit('joinedQuiz', {
          success: false,
          message: 'Quiz not found.',
        });
      }
    });

    socket.on('startQuiz', ({ quizSessionId }) => {
      io.to(quizSessionId).emit(
        'receiveQuestion',
        activeQuizzes[quizSessionId].questions[
          activeQuizzes[quizSessionId].currentQuestionIndex
        ]
      );
      activeQuizzes[quizSessionId].currentQuestionStartTime = Date.now();
      console.log(
        `participant length: ${activeQuizzes[quizSessionId].participants.length}`
      );
      setInterval(() => {
        if (
          activeQuizzes[quizSessionId] &&
          activeQuizzes[quizSessionId].currentQuestionStartTime
        ) {
          const quiz = activeQuizzes[quizSessionId];
          const timeElapsed = Math.floor(
            (Date.now() - quiz.currentQuestionStartTime) / 1000
          );
          const allQuestions = activeQuizzes[quizSessionId].questions;
          const timeRemaining =
            allQuestions[quiz.currentQuestionIndex]?.timeLimit - timeElapsed;

          if (timeRemaining >= 0) {
            io.to(quizSessionId).emit('timeUpdate', timeRemaining);
          } else {
            // Time's up, move to next question or show results
            quiz.currentQuestionStartTime = null;
            if (++quiz.currentQuestionIndex < allQuestions.length) {
              startQuestionTimer(quizSessionId);
            } else {
              io.to(quizSessionId).emit('quizFinished', {
                message: 'Quiz has finished.',
              });
              console.log(`Quiz ${quizSessionId} has finished`);
              // start over the quiz // for testing purposes
              // quiz.currentQuestionIndex = 0;
              // startQuestionTimer(quizSessionId);
            }
          }
        }
      }, 1000); // Update every second
    });

    socket.on('submitAnswer', (data) => {
      const quiz = activeQuizzes[data.quizSessionId];
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
      for (const quizSessionId in activeQuizzes) {
        const quiz = activeQuizzes[quizSessionId];
        const hostIndex = quiz.host === socket.id;
        if (hostIndex) {
          delete activeQuizzes[quizSessionId];
          console.log(`Host ${socket.id} left quiz ${quizSessionId}`);
          console.log(`Quiz ${quizSessionId} has been deleted`);
        }
      }
    });
  });
}

module.exports = socketSetup;
