const socketIo = require('socket.io');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');
const { instrument } = require('@socket.io/admin-ui');
require('dotenv').config();

const MAX_SCORE = 1000;
const MIN_SCORE = 300;
const DELAY_BEFORE_NEXT_QUESTION = 2500;
const DELAY = 1500;

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
      // Add delay to the time limit to account for the delay in the client
      quiz.currentQuestionEndTime =
        Date.now() +
        quiz.questions[quiz.currentQuestionIndex].timeLimit * 1000 +
        DELAY;
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
              }, DELAY_BEFORE_NEXT_QUESTION); // delay before moving to next question
            }
          }, DELAY);
        } else {
          // Add a delay before ending the quiz
          setTimeout(() => {
            endQuestion(quiz, io, quizSessionId);
            setTimeout(() => {
              endQuizSession(quiz, io, quizSessionId);
            }, DELAY_BEFORE_NEXT_QUESTION);
          }, DELAY);
        }
      }, quiz.questions[quiz.currentQuestionIndex].timeLimit * 1000);
    }

    socket.on('hostJoinQuiz', async ({ quizSessionId }) => {
      const quizSession = await QuizSession.findById(quizSessionId);
      const quiz = await Quiz.findById(quizSession.quiz); // get quiz from quizSession

      // Check if a host is already in the session
      if (quizSessions[quizSessionId] && quizSessions[quizSessionId].host) {
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
      }, DELAY);
    });

    socket.on('submitAnswer', (data) => {
      if (!data || !data.quizSessionId || !Array.isArray(data.answer)) return;

      const quiz = quizSessions[data.quizSessionId];
      if (!quiz) return;

      const participant = quiz.participants[socket.id];
      if (!participant) return;

      const question = quiz.questions[quiz.currentQuestionIndex];
      if (!question) return;

      // Initialize participant's answers if not already done
      if (!participant.answers) {
        participant.answers = [];
      }

      if (hasAlreadyAnswered(participant, question._id)) {
        return;
      }

      // check if answer was submitted after the time limit
      if (Date.now() > quiz.currentQuestionEndTime) {
        return;
      }

      // calculate score and update participant's answers
      const answer = createAnswer(question, data.answer, quiz);
      participant.totalScore += answer.score;
      participant.answers.push(answer);
    });

    socket.on('disconnect', () => {
      for (const quizSessionId in quizSessions) {
        if (quizSessions[quizSessionId].host === socket.id) {
          delete quizSessions[quizSessionId];
          io.to(quizSessionId).emit('hostLeft');
        } else if (quizSessions[quizSessionId].participants[socket.id]) {
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
      delete quizSessions[quizSessionId];
    });
  } catch (error) {
    console.error('Error updating quiz session:', error);
  }
}

function hasAlreadyAnswered(participant, questionId) {
  const lastAnswer = participant.answers[participant.answers.length - 1];
  return lastAnswer && lastAnswer.questionId === questionId;
}

function createAnswer(question, userAnswer, quiz) {
  let score = 0;
  let timeTaken = null;
  if (
    userAnswer.length === question.answer.length &&
    userAnswer.every((ans) => question.answer.includes(ans))
  ) {
    if (quiz.scoreByTime) {
      const timeLimit = question.timeLimit * 1000; // convert to milliseconds
      timeTaken = Date.now() - quiz.currentQuestionStartTime;
      score = MAX_SCORE - (timeTaken / timeLimit) * (MAX_SCORE - MIN_SCORE);
      score = Math.round(score);
      score = Math.max(MIN_SCORE, score);
    } else {
      score = 1;
    }
  }

  return {
    questionId: question._id,
    answer: userAnswer,
    score: score,
    timeTaken: quiz.scoreByTime ? timeTaken : undefined,
  };
}

module.exports = socketSetup;
