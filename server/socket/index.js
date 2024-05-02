const socketIo = require('socket.io');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
const { instrument } = require('@socket.io/admin-ui');
require('dotenv').config();

const maxScore = 1000;
const minScore = 300;
const delayBeforeNextQuestion = 3000; // 3 seconds

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
            }, delayBeforeNextQuestion); // delay before moving to next question
          }
        } else {
          // Add a delay before ending the quiz
          setTimeout(() => {
            endQuizSession(quiz, io, quizSessionId);
          }, delayBeforeNextQuestion);
        }
      }, quiz.questions[quiz.currentQuestionIndex].timeLimit * 1000);
    }

    socket.on('hostJoinQuiz', async ({ quizSessionId }) => {
      const quizSession = await QuizSession.findById(quizSessionId);
      const quiz = await Quiz.findById(quizSession.quiz); // get quiz from quizSession

      // Check if a host is already in the session
      if (quizSessions[quizSessionId] && quizSessions[quizSessionId].host) {
        console.log(
          `Host ${socket.id} attempted to join quiz ${quizSessionId}, but another host is already in the session.`
        );
        socket.emit('joinedQuiz', {
          success: false,
          message: 'Another host is already in this quiz session.',
        });
        return;
      }

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

    socket.on(
      'startQuiz',
      ({ quizSessionId, isManualControl, scoreByTime }) => {
        quizSessions[quizSessionId].isManualControl = isManualControl;
        quizSessions[quizSessionId].scoreByTime = scoreByTime;
        io.to(quizSessionId).emit('quizStarted', {
          scoreByTime: scoreByTime,
        });
        startQuestionTimer(quizSessionId);
      }
    );

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
      if (!quizSessions[data.quizSessionId]) return;
      const quiz = quizSessions[data.quizSessionId];
      const question = quiz.questions[quiz.currentQuestionIndex];

      // check if user has already answered this question
      const lastAnswer =
        quiz.participants[socket.id].answers[
          quiz.participants[socket.id].answers.length - 1
        ];
      if (lastAnswer && lastAnswer.questionId === question._id) {
        return;
      }

      // check if answer was submitted after the time limit
      if (Date.now() > quiz.currentQuestionEndTime) {
        return;
      }

      let score = 1;
      const answer = {
        questionId: question._id,
        answer: data.answer,
      };
      if (quiz.scoreByTime) {
        const timeLimit = question.timeLimit * 1000; // convert to milliseconds
        const timeTaken = Date.now() - quiz.currentQuestionStartTime;
        score = maxScore - (timeTaken / timeLimit) * (maxScore - minScore);
        score = Math.round(score);
        score = Math.max(minScore, score);
        answer.timeTaken = timeTaken;
      }
      quiz.participants[socket.id].answers.push(answer);

      if (
        data.answer.length === question.answer.length &&
        data.answer.every((ans) => question.answer.includes(ans))
      ) {
        console.log(`User ${socket.id} answered correctly`);
        quiz.participants[socket.id].score += score;
        if (quiz.scoreByTime) {
          // send what score the user got
          socket.emit('answerResult', {
            score: score,
          });
        }
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
          io.to(quizSessionId).emit('hostLeft');
        } else if (quizSessions[quizSessionId].participants[socket.id]) {
          console.log(`Participant ${socket.id} disconnected`);
          // quizSessions[quizSessionId].participants[socket.id].active = false;
          delete quizSessions[quizSessionId].participants[socket.id];
          io.to(quizSessionId).emit('participantLeft', {
            participantId: socket.id,
          });
        }
      }
    });
  });
}

function endQuizSession(quiz, io, quizSessionId) {
  try {
    const participantsArray = Object.values(quiz.participants);
    io.to(quizSessionId).emit('quizFinished', {
      message: 'Quiz has finished.',
      participants: participantsArray,
    });
    // save the results to the database
    QuizSession.findByIdAndUpdate(quizSessionId, {
      participants: participantsArray,
      isFinished: true,
    }).then(() => {
      console.log('Quiz session updated');
      delete quizSessions[quizSessionId];
    });
  } catch (error) {
    console.error('Error updating quiz session:', error);
  }
}

module.exports = socketSetup;
