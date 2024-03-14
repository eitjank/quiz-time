import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';

const QuizHostSession = () => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [started, setStarted] = useState(false);
  const { id } = useParams();
  const { currentQuestion, timer, socket, results, finished, participants } =
    useQuizSession(id);

  useEffect(() => {
    if (!socket) return;
    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        console.log('Joined quiz');
      } else {
        alert(data.message);
      }
    });

    socket.emit('hostJoinQuiz', { quizSessionId: id });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
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
    socket.emit('startQuiz', { quizSessionId: id });
    setStarted(true);
  };

  const progressBarWidth =
    currentQuestion.timeLimit !== 0
      ? ((timer - 1) / (currentQuestion.timeLimit - 1)) * 100
      : 0;

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
              <p>{currentQuestion.question}</p>
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
