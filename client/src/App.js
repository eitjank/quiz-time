import './App.css';
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const socket = socketIOClient(ENDPOINT);

function App() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setUserAnswer(''); // Reset answer for the new question
    });

    // Request a question when the component mounts
    socket.emit('requestQuestion', {});

    return () => {
      socket.off('receiveQuestion');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(userAnswer === currentQuestion.answer) {
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

  return (
    <div className="App">
      <h1>Quiz Time!</h1>
      {currentQuestion.question && (
        <>
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
