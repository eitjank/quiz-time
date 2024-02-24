import './App.css';
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const socket = socketIOClient(ENDPOINT);

function App() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [showTimesUpMessage, setShowTimesUpMessage] = useState(false);

  useEffect(() => {
    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setUserAnswer(''); // Reset answer for the new question
      setTimer(question.timeLimit); // Initialize timer with question's time limit
      setShowTimesUpMessage(false); // Hide "Time's Up" message
    });

    // Request a question when the component mounts
    socket.emit('requestQuestion', {});

    return () => {
      socket.off('receiveQuestion');
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000); // Update every second
  
      return () => clearInterval(countdown); // Cleanup on component unmount or when new question comes in
    } else if (timer === 0) {
      setShowTimesUpMessage(true); // Show "Time's Up" message
      // Handle timeout (e.g., submit answer, show message, request next question)
      const timeout = setTimeout(() => {
        // Request a new question
        socket.emit('requestQuestion', {});
        setShowTimesUpMessage(false); // Hide "Time's Up" message
      }, 1500); // Wait 1.5 seconds before requesting a new question
  
      return () => clearTimeout(timeout);
    }
  }, [timer]); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer === currentQuestion.answer) {
      alert('Correct!');
    } else {
      alert('Incorrect!');
    }
    // Request a new question
    socket.emit('requestQuestion', {});
  };

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
              checked={userAnswer === option}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ));
      case 'openEnded':
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
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
              checked={userAnswer.toLowerCase() === option.toLowerCase()}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <label htmlFor={`trueFalse-${index}`}>{option}</label>
          </div>
        ));
      default:
        return null;
    }
  };

  const progressBarWidth = (timer - 1) / (currentQuestion.timeLimit - 1) * 100;

  return (
    <div className="App">
      <h1>Quiz Time!</h1>
      {currentQuestion.question && (
        <>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressBarWidth}%` }}></div>
            {showTimesUpMessage && <p className="times-up-message">Time's Up! Next question coming up...</p>}
          </div>
          <p>Time left: {timer} seconds</p>
          <p>{currentQuestion.question}</p>
          <form onSubmit={handleSubmit}>
            {renderQuestionInput(currentQuestion)}
            <button type="submit">Submit</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
