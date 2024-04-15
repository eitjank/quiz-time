import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QUIZZES_ENDPOINT,
  QUIZ_SESSIONS_START_ENDPOINT,
} from '../api/endpoints';
import { toast } from 'react-toastify';
import {
  Button,
  Container,
  Grid,
  Paper,
  Text,
  Space,
  Group,
} from '@mantine/core';

const QuizList = ({ endpoint }) => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(endpoint, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error(err));
  }, [endpoint]);

  const handleView = (quiz) => {
    navigate(`/quizzes/${quiz._id}/view`);
  };

  const handleEdit = (quiz) => {
    navigate(`/quizzes/${quiz._id}/edit`);
  };

  const handleDelete = async (quiz) => {
    try {
      const response = await fetch(`${QUIZZES_ENDPOINT}/${quiz._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setQuizzes(quizzes.filter((q) => q._id !== quiz._id));
      } else {
        toast.error('Failed to delete quiz');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHost = async (quizId) => {
    try {
      const res = await fetch(QUIZ_SESSIONS_START_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      navigate(`/quizSessions/${data.quizSessionId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Container size="md">
        <h1>Quizzes</h1>
        <Button onClick={() => navigate('/quizzes/create')}>Create Quiz</Button>
        <Grid gutter="md">
          {quizzes &&
            quizzes.map((quiz, index) => (
              <Grid.Col key={index} span={12} sm={6} md={4}>
                <Paper shadow="md">
                  <Text size="xl">{quiz.name}</Text>
                  <Text size="sm">{quiz.description}</Text>
                  <Group justify="center">
                    <Button onClick={() => handleHost(quiz._id)}>Host</Button>
                    <Button onClick={() => handleView(quiz)}>View</Button>
                    <Button onClick={() => handleEdit(quiz)}>Edit</Button>
                    <Button onClick={() => handleDelete(quiz)}>Delete</Button>
                  </Group>
                  <Space h="lg" />
                </Paper>
              </Grid.Col>
            ))}
        </Grid>
      </Container>
    </div>
  );
};

export default QuizList;
