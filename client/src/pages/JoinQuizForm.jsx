import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, TextInput } from '@mantine/core';

function JoinQuizForm() {
  const [quizSessionId, setQuizSessionId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quizSessionId) return alert('Please enter a quiz ID');
    navigate(`/quizzes/${quizSessionId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container>
        <TextInput
          placeholder="Enter Quiz ID"
          value={quizSessionId}
          onChange={(e) => setQuizSessionId(e.target.value)}
        />
        <br />
        <Button type="submit">Join Quiz</Button>
      </Container>
    </form>
  );
}

export default JoinQuizForm;
