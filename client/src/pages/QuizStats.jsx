import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import {
  Container,
  Text,
  Title,
  Stack,
  Space,
  Loader,
  Group,
} from '@mantine/core';
import { PieChart } from '@mantine/charts';
import BorderedCard from '../components/BorderedCard/BorderedCard';

const QuizStats = () => {
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}/stats`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          toast.error(`Network response error. ${response.statusText}`);
          throw new Error('Network response error.');
        }
        return response.json();
      })
      .then((data) => setStats(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  if (!stats) {
    return <Loader />;
  }

  return (
    <Container>
      <Title>{stats.name} Statistics</Title>
      <Space h="sm" />
      {Object.entries(stats.questionStats).map(
        ([questionId, questionStats]) => (
          <BorderedCard key={questionId}>
            <Stack>
              <Title order={3}>{questionStats.questionText}</Title>
              <Text>Total Attempts: {questionStats.totalAttempts}</Text>
              {questionStats.totalAttempts > 0 && (
                <>
                  <Text>Correct/Incorrect Answers</Text>
                  <Group justify="center">
                    <PieChart
                      data={[
                        {
                          value: questionStats.correctAnswers,
                          color: 'teal',
                          name: 'Correct',
                        },
                        {
                          value: questionStats.incorrectAnswers,
                          color: 'red',
                          name: 'Incorrect',
                        },
                      ]}
                      withTooltip
                    />
                  </Group>
                  <Text>
                    Correct Answer Percentage: {questionStats.percentageCorrect}
                    %
                  </Text>
                  {questionStats.mostCommonIncorrectAnswer && (
                    <Text>
                      Most Common Incorrect Answer:{' '}
                      {questionStats.mostCommonIncorrectAnswer}
                    </Text>
                  )}
                </>
              )}
            </Stack>
          </BorderedCard>
        )
      )}
    </Container>
  );
};

export default QuizStats;
