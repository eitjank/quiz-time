import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinQuizForm() {
  const [quizSessionId, setQuizSessionId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!quizSessionId) return alert('Please enter a quiz ID')
    navigate(`/quizzes/${quizSessionId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Join Quiz ID"
        value={quizSessionId}
        onChange={(e) => setQuizSessionId(e.target.value)}
      />
      <button type="submit">Join Quiz</button>
    </form>
  );
}

export default JoinQuizForm;
