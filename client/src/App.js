import './App.css';
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const socket = socketIOClient(ENDPOINT);

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');


  useEffect(() => {
    socket.on('receiveQuestion', (data) => {
      setQuestion(data.question);
      setAnswer(data.answer);
      setUserAnswer('');
    });

    // Request a question when the component mounts
    socket.emit('requestQuestion', {});

    return () => {
      socket.off('receiveQuestion');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(userAnswer === answer) {
      alert('Correct!');
    } else {
      alert('Incorrect!');
    }
    // Request a new question
    socket.emit('requestQuestion', {});
  };

  return (
    <div>
      <h1>Quiz Time!</h1>
      <p>{question}</p>
      <form onSubmit={handleSubmit}>
        <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
