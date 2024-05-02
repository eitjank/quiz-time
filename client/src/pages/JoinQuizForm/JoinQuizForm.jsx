import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, TextInput } from '@mantine/core';
import BorderedCard from '../../components/BorderedCard/BorderedCard';

function JoinQuizForm() {
  const [quizSessionId, setQuizSessionId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quizSessionId) return alert('Please enter a quiz ID');
    navigate(`/quizzes/${quizSessionId}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    >
      <Container size="sm">
        <BorderedCard style={{ minWidth: 300 }}>
          <TextInput
            placeholder="Enter Quiz ID"
            value={quizSessionId}
            onChange={(e) => setQuizSessionId(e.target.value)}
            style={{ marginBottom: 15 }}
          />
          <Button type="submit" fullWidth>
            Join Quiz
          </Button>
        </BorderedCard>
      </Container>
    </form>
  );
}

export default JoinQuizForm;
