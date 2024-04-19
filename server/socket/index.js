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
      if (!quizSessions[quizSessionId]) return;
      const quiz = quizSessions[quizSessionId];
      quiz.currentQuestionStartTime = Date.now();
      // Add grace period to the time limit to account for the delay in the client
      quiz.currentQuestionEndTime =
        Date.now() +
        quiz.questions[quiz.currentQuestionIndex].timeLimit * 1000 +
        1500;
      io.to(quizSessionId).emit(
        'receiveQuestion',
        quiz.questions[quiz.currentQuestionIndex]
      );
      quiz.timeoutId = setTimeout(() => {
        io.to(quizSessionId).emit('timeUpdate', 0);
        if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
          if (!quiz.isManualControl) {
            // If manual control is disabled, automatically move to next question
            setTimeout(() => {
              quiz.currentQuestionIndex++;
              startQuestionTimer(quizSessionId);
            }, 4000); // 4 seconds delay before moving to next question
          }
        } else {
          endQuizSession(quiz, io, quizSessionId);
        }
      }, quiz.questions[quiz.currentQuestionIndex].timeLimit * 1000);
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

    socket.on('joinQuiz', async ({ quizSessionId, name }) => {
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
          name: name,
          id: socket.id,
          score: 0,
          answers: [],
        };
        // Notify all in the romm that a participant has joined
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

    socket.on('changeName', ({ quizSessionId, name }) => {
      if (!quizSessions[quizSessionId]) return;
      if (!quizSessions[quizSessionId].participants[socket.id]) return;
      if (!name) return;
      quizSessions[quizSessionId].participants[socket.id].name = name;
      io.to(quizSessionId).emit('participantList', {
        participants: Object.values(quizSessions[quizSessionId].participants),
      });
    });

    socket.on('startQuiz', ({ quizSessionId, isManualControl }) => {
      quizSessions[quizSessionId].isManualControl = isManualControl;
      startQuestionTimer(quizSessionId);
    });

    socket.on('nextQuestion', ({ quizSessionId }) => {
      const quiz = quizSessions[quizSessionId];
      if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
        quiz.currentQuestionIndex++;
        startQuestionTimer(quizSessionId);
      } else {
        endQuizSession(quiz, io, quizSessionId);
      }
    });

    socket.on('skipQuestion', ({ quizSessionId }) => {
      quizSessions[quizSessionId].currentQuestionStartTime = null;
      if (quizSessions[quizSessionId].timeoutId)
        clearTimeout(quizSessions[quizSessionId].timeoutId);
      io.to(quizSessionId).emit('timeUpdate', 0);
    });

    socket.on('submitAnswer', (data) => {
      const quiz = quizSessions[data.quizSessionId];
      const question = quiz.questions[quiz.currentQuestionIndex];

      // check if answer was submitted after the time limit
      if (Date.now() > quiz.currentQuestionEndTime) {
        console.log(`User ${socket.id} submitted answer after time limit`);
        return;
      }

      quiz.participants[socket.id].answers.push({
        questionId: question._id,
        answer: data.answer,
      });
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
          quizSessions[quizSessionId].participants[socket.id].active = false;
          io.to(quizSessionId).emit('participantLeft', {
            participantId: socket.id,
          });
        }
      }
    });
  });
}

function endQuizSession(quiz, io, quizSessionId) {
  const participantsArray = Object.values(quiz.participants);
  io.to(quizSessionId).emit('quizFinished', {
    message: 'Quiz has finished.',
    participants: participantsArray,
  });
  // save the results to the database
  try {
    QuizSession.findByIdAndUpdate(quizSessionId, {
      participants: participantsArray,
      isFinished: true,
    }).then(() => {
      console.log('Quiz session updated');
    });
  } catch (error) {
    console.error('Error updating quiz session:', error);
  }
}

module.exports = socketSetup;
