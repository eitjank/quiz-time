const socketIo = require('socket.io');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
const { instrument } = require('@socket.io/admin-ui');
require('dotenv').config();

const maxScore = 1000;
const minScore = 300;
const delayBeforeNextQuestion = 2500;
const delpayPeriod = 1500;

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
      const question = quiz.questions[quiz.currentQuestionIndex];
      const questionToSend = {
        type: question.type,
        question: question.question,
        options: question.options,
        timeLimit: question.timeLimit,
      };
      socket.emit('receiveQuestion', questionToSend);
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
      const question = quiz.questions[quiz.currentQuestionIndex];
      const questionToSend = {
        type: question.type,
        question: question.question,
        options: question.options,
        timeLimit: question.timeLimit,
      };
      io.to(quizSessionId).emit('receiveQuestion', questionToSend);
      quiz.timeoutId = setTimeout(() => {
        io.to(quizSessionId).emit('timeUpdate', 0);
        if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
          setTimeout(() => {
            endQuestion(quiz, io, quizSessionId);
            if (!quiz.isManualControl) {
              // If manual control is disabled, automatically move to next question
              setTimeout(() => {
                quiz.currentQuestionIndex++;
                startQuestionTimer(quizSessionId);
              }, delayBeforeNextQuestion); // delay before moving to next question
            }
          }, delpayPeriod);
        } else {
          // Add a delay before ending the quiz
          setTimeout(() => {
            endQuestion(quiz, io, quizSessionId);
            setTimeout(() => {
              console.log('Ending quiz session');
              endQuizSession(quiz, io, quizSessionId);
            }, delayBeforeNextQuestion);
          }, delpayPeriod);
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
          totalScore: 0,
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
        endQuestion(quiz, io, quizSessionId);
        endQuizSession(quiz, io, quizSessionId);
      }
    });

    socket.on('skipQuestion', ({ quizSessionId }) => {
      const quiz = quizSessions[quizSessionId];
      quiz.currentQuestionStartTime = null;
      if (quiz.timeoutId) clearTimeout(quiz.timeoutId);
      io.to(quizSessionId).emit('timeUpdate', 0);
      setTimeout(() => {
        endQuestion(quiz, io, quizSessionId);
      }, delpayPeriod);
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
        score: 0,
      };
      if (
        data.answer.length === question.answer.length &&
        data.answer.every((ans) => question.answer.includes(ans))
      ) {
        answer.score = 1;
        if (quiz.scoreByTime) {
          const timeLimit = question.timeLimit * 1000; // convert to milliseconds
          const timeTaken = Date.now() - quiz.currentQuestionStartTime;
          score = maxScore - (timeTaken / timeLimit) * (maxScore - minScore);
          score = Math.round(score);
          score = Math.max(minScore, score);
          answer.timeTaken = timeTaken;
          answer.score = score;
        }
        quiz.participants[socket.id].totalScore += answer.score;
      }
      quiz.participants[socket.id].answers.push(answer);
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
          delete quizSessions[quizSessionId].participants[socket.id];
          io.to(quizSessionId).emit('participantLeft', {
            participantId: socket.id,
          });
        }
      }
    });
  });
}

function endQuestion(quiz, io, quizSessionId) {
  io.to(quizSessionId).emit('correctAnswer', {
    correctAnswer: quiz.questions[quiz.currentQuestionIndex].answer,
  });
  const question = quiz.questions[quiz.currentQuestionIndex];
  for (const participantId in quiz.participants) {
    const participant = quiz.participants[participantId];
    const lastAnswer = participant.answers[participant.answers.length - 1];
    if (lastAnswer && lastAnswer.questionId === question._id) {
      io.to(participantId).emit('answerResult', {
        score: lastAnswer.score,
        totalScore: participant.totalScore,
      });
    }
  }
}

function endQuizSession(quiz, io, quizSessionId) {
  try {
    const participantsArray = Object.values(quiz.participants).map(
      (participant) => ({
        name: participant.name,
        id: participant.id,
        totalScore: participant.totalScore,
      })
    );
    io.to(quizSessionId).emit('quizFinished', {
      message: 'Quiz has finished.',
      participants: participantsArray,
    });
    // save the results to the database
    QuizSession.findByIdAndUpdate(quizSessionId, {
      participants: Object.values(quiz.participants),
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
