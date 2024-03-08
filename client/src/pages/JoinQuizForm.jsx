import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinQuizForm() {
  const [quizId, setQuizId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!quizId) return alert('Please enter a quiz ID')
    navigate(`/quizzes/${quizId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Quiz ID"
        value={quizId}
        onChange={(e) => setQuizId(e.target.value)}
      />
      <button type="submit">Join Quiz</button>
    </form>
  );
}

export default JoinQuizForm;
