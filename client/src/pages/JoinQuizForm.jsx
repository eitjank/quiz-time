import React, { useState } from 'react';

function JoinQuizForm({ onJoinQuiz }) {
  const [quizId, setQuizId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoinQuiz(quizId);
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
