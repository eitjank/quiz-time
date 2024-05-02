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
  Text,
  Space,
  Group,
  Autocomplete,
  FileButton,
  Title,
} from '@mantine/core';
import { readFile } from '../utils/readFile';
import BorderedCard from './BorderedCard/BorderedCard';

const QuizList = ({ endpoint, myQuizzes }) => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

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
        toast('Quiz deleted successfully');
      } else {
        toast.error(`Failed to delete quiz. ${response.statusText}`);
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

  const handleImport = async (file) => {
    try {
      const content = await readFile(file);
      const json = JSON.parse(content);
      const response = await fetch(`${QUIZZES_ENDPOINT}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        toast.error(`Failed to import quiz. ${response.statusText}`);
        throw new Error(`Failed to import quiz. ${response.statusText}`);
      }
      // navigate to the imported quiz
      const data = await response.json();
      navigate(`/quizzes/${data.quizId}/edit`);

      toast('Quiz imported successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Container size="md">
        {myQuizzes ? (
          <>
            <Title>My Quizzes</Title>
            <Space h="md" />
            <Group justify="center">
              <Button
                variant="primary"
                onClick={() => navigate('/quizzes/create')}
              >
                Create Quiz
              </Button>
              <FileButton onChange={handleImport} accept="application/json">
                {(props) => (
                  <Button variant="default" {...props}>
                    Import Quiz
                  </Button>
                )}
              </FileButton>
            </Group>
          </>
        ) : (
          <Title>Quizzes</Title>
        )}
        <Space h="lg" />
        <Autocomplete
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search quizzes..."
        />
        <Space h="lg" />
        <Grid gutter="md">
          {quizzes &&
            quizzes
              .filter((quiz) =>
                quiz.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((quiz, index) => (
                <Grid.Col key={index} span={12} sm={6} md={4}>
                  <BorderedCard>
                    <Text size="xl">{quiz.name}</Text>
                    <Text size="sm">{quiz.description}</Text>
                    <Space h="sm" />
                    <Group justify="center">
                      <Button
                        variant="primary"
                        onClick={() => handleHost(quiz._id)}
                      >
                        Host
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleView(quiz)}
                      >
                        View
                      </Button>
                      {myQuizzes && (
                        <>
                          <Button
                            variant="default"
                            onClick={() => handleEdit(quiz)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            color="red"
                            onClick={() => handleDelete(quiz)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Group>
                  </BorderedCard>
                </Grid.Col>
              ))}
        </Grid>
      </Container>
    </div>
  );
};

export default QuizList;
