const socketIo = require('socket.io');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
const { instrument } = require('@socket.io/admin-ui');
require('dotenv').config();

let quizSessions = [];

function socketSetup(server) {
  const io = socketIo(server, {
    cors: {
      origin: [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'https://admin.socket.io',
      ],
      credentials: true,
    },
  });

  instrument(io, {
    auth: false,
  });

  io.on('connection', (socket) => {
    console.log(`New client connected with ID: ${socket.id}`);

    socket.on('requestQuestion', (data) => {
      const quiz = quizSessions[data.quizSessionId];
      socket.emit('receiveQuestion', quiz.questions[quiz.currentQuestionIndex]);
    });

    function startQuestionTimer(quizSessionId) {
      const quiz = quizSessions[quizSessionId];
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
      quizSessions[quizSessionId] = {
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
      quizSession.participants[socket.id] = {
        id: socket.id,
        score: 0,
      };
      await quizSession.save();
      const quiz = await Quiz.findById(quizSession.quiz); // get quiz from quizSession

      if (quizSessions[quizSessionId]) {
        socket.join(quizSessionId);
        console.log(`User ${socket.id} joined quiz ${quizSessionId}`);
        socket.emit('joinedQuiz', {
          success: true,
          quizSessionId: quizSessionId,
          message: 'Successfully joined quiz.',
        });

        // Add participant to the quiz
        quizSessions[quizSessionId].participants[socket.id] = {
          // name: participantName, // for future use
          id: socket.id,
          score: 0,
        };
        // Notify the all in the romm that a participant has joined
        io.to(quizSessionId).emit('participantList', {
          participants: Object.values(quizSessions[quizSessionId].participants),
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
        quizSessions[quizSessionId].questions[
          quizSessions[quizSessionId].currentQuestionIndex
        ]
      );
      quizSessions[quizSessionId].currentQuestionStartTime = Date.now();
      console.log(
        `participant length: ${quizSessions[quizSessionId].participants.length}`
      );
      setInterval(() => {
        if (
          quizSessions[quizSessionId] &&
          quizSessions[quizSessionId].currentQuestionStartTime
        ) {
          const quiz = quizSessions[quizSessionId];
          const timeElapsed = Math.floor(
            (Date.now() - quiz.currentQuestionStartTime) / 1000
          );
          const allQuestions = quizSessions[quizSessionId].questions;
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
              const participantsArray = Object.values(quiz.participants); // convert object to array
              io.to(quizSessionId).emit('quizFinished', {
                message: 'Quiz has finished.',
                participants: participantsArray,
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
      const quiz = quizSessions[data.quizSessionId];
      const question = quiz.questions[quiz.currentQuestionIndex];
      if (data.answer === question.answer) {
        console.log(`User ${socket.id} answered correctly`);
        quiz.participants[socket.id].score++;
      } else {
        console.log(`User ${socket.id} answered incorrectly`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected with ID: ${socket.id}`);
      for (const quizSessionId in quizSessions) {
        if (quizSessions[quizSessionId].host === socket.id) {
          console.log(`Host ${socket.id} disconnected`);
          delete quizSessions[quizSessionId];
        } else if (quizSessions[quizSessionId].participants[socket.id]) {
          console.log(`Participant ${socket.id} disconnected`);
          delete quizSessions[quizSessionId].participants[socket.id];
          io.to(quizSessionId).emit('participantLeft', {
            participantId: socket.id,
          });
        }
      }
    });
  });
}

module.exports = socketSetup;
