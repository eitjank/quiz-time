import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';

function Quiz() {
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  const progressBarWidth =
    currentQuestion.timeLimit !== 0
      ? ((timer - 1) / (currentQuestion.timeLimit - 1)) * 100
      : 0;

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
    });

    socket.emit('joinQuiz', { quizSessionId: id });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        setJoined(true);
      } else {
        console.log(data.message);
        setJoined(false);
        alert(data.message);
        navigate('/join');
      }
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on('quizFinished', (data) => {
      console.log('Quiz finished');
      console.log(data);
    });

    return () => {
      // Clean up the socket connection
      socket.off('receiveQuestion');
      socket.off('joinedQuiz');
      socket.off('timeUpdate');
      socket.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
      setIsCorrect(answer === currentQuestion.answer);
      socket.emit('submitAnswer', { quizSessionId: id, answer });
      setAnswer('');
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
      {renderQuestionInput(currentQuestion)}
      {showAnswer && <p>The correct answer is: {currentQuestion.answer}</p>}
      {showAnswer &&
        isCorrect !== null &&
        (isCorrect ? (
          <p>Your answer is correct!</p>
        ) : (
          <p>Your answer is incorrect.</p>
        ))}
    </>
  );
}

export default Quiz;
