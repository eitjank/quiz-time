import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';
import { BASE_URL } from '../api/endpoints';

const QuizHostSession = () => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [started, setStarted] = useState(false);
  const { id } = useParams();
  const { socket, results, finished, participants } = useQuizSession();
  const [isManualControl, setIsManualControl] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(100);

  useEffect(() => {
    if (currentQuestion.timeLimit !== 0) {
      setProgressBarWidth(
        ((timer - 1) / (currentQuestion.timeLimit - 1)) * 100
      );
    } else {
      setProgressBarWidth(0);
    }
    if (timer === 0) {
      setProgressBarWidth(0);
    }
  }, [timer, currentQuestion.timeLimit]);

  useEffect(() => {
    if (!socket) return;
    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        console.log('Joined quiz');
      } else {
        alert(data.message);
      }
    });

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.emit('hostJoinQuiz', { quizSessionId: id });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
    };
  }, [id, socket]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
    } else {
      setShowAnswer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const startQuiz = () => {
    socket.emit('startQuiz', { quizSessionId: id, isManualControl });
    setStarted(true);
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return question.options.map((option, index) => (
          <ul key={index}>
            <li htmlFor={`option-${index}`}>{option}</li>
          </ul>
        ));
      case 'trueFalse':
        return ['True', 'False'].map((option, index) => (
          <ul key={index}>
            <li htmlFor={`trueFalse-${index}`}>{option}</li>
          </ul>
        ));
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Quiz Host Session</h1>
      <h2>Quiz Session ID: {id}</h2>
      {!finished ? (
        <>
          {!started ? (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={isManualControl}
                  onChange={() => setIsManualControl(!isManualControl)}
                />
                Manual Control
              </label>
              <button onClick={startQuiz}>Start Quiz</button>
              <h2>Participants:</h2>
              <ul>
                {participants.map((participant) => (
                  <li key={participant.id}>{participant.id}</li>
                ))}
              </ul>
            </>
          ) : (
            <div>
              <h1>Quiz Time!</h1>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progressBarWidth}%` }}
                ></div>
              </div>
              <p>Time left: {timer} seconds</p>
              {isManualControl && (
                <>
                  {showAnswer ? (
                    <button
                      onClick={() => {
                        socket.emit('nextQuestion', { quizSessionId: id });
                        setShowAnswer(false);
                      }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        socket.emit('skipQuestion', { quizSessionId: id })
                      }
                    >
                      Skip Question
                    </button>
                  )}
                </>
              )}
              <p>{currentQuestion.question}</p>
              {currentQuestion.image && (
                <img
                  src={`${BASE_URL}/${currentQuestion.image}`}
                  alt="Question"
                />
              )}
              {renderQuestionInput(currentQuestion)}
              {showAnswer && (
                <p>The correct answer is: {currentQuestion.answer}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <Leaderboard results={results} />
      )}
    </div>
  );
};

export default QuizHostSession;
