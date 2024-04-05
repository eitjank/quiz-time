import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';
import { BASE_URL } from '../api/endpoints';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, results, finished, participants } = useQuizSession(id);
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
    socket.emit('joinQuiz', { quizSessionId: id });

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
      setAnswer('');
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        setJoined(true);
      } else {
        setJoined(false);
        alert(data.message);
        navigate('/join');
      }
    });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
    };
  }, [id, navigate, socket]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
      setIsCorrect(answer === currentQuestion.answer);
      socket.emit('submitAnswer', { quizSessionId: id, answer });
    } else {
      setShowAnswer(false);
      setIsCorrect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return question.options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`option-${index}`}
              name="quizOption"
              value={option}
              checked={answer === option}
              disabled={showAnswer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ));
      case 'openEnded':
        return (
          <input
            type="text"
            value={answer}
            disabled={showAnswer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );
      case 'trueFalse':
        return ['True', 'False'].map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`trueFalse-${index}`}
              name="trueFalseOption"
              value={option}
              checked={answer.toLowerCase() === option.toLowerCase()}
              disabled={showAnswer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <label htmlFor={`trueFalse-${index}`}>{option}</label>
          </div>
        ));
      default:
        return null;
    }
  };

  if (joined === false) {
    return <p>Joining quiz...</p>;
  }

  return (
    <>
      <h1>Quiz Time!</h1>
      {!finished ? (
        <>
          {!currentQuestion.question ? (
            <>
              <h2>Participants:</h2>
              <ul>
                {participants.map((participant) => (
                  <li key={participant.id}>{participant.id}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {currentQuestion.question && (
                <>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progressBarWidth}%` }}
                    ></div>
                  </div>
                  <p>Time left: {timer} seconds</p>
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
              {showAnswer &&
                isCorrect !== null &&
                (isCorrect ? (
                  <p>Your answer is correct!</p>
                ) : (
                  <p>Your answer is incorrect.</p>
                ))}
            </>
          )}
        </>
      ) : (
        <Leaderboard results={results} />
      )}
    </>
  );
}

export default Quiz;
