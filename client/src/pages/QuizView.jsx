import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { Container, Text, Space, Title } from '@mantine/core';
import OptionsList from '../components/OptionsList/OptionsList';
import BorderedCard from '../components/BorderedCard';

function QuizView() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}?withOwner=true`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch((err) => console.error(err));
  }, [id]);

  function formatQuestionType(type) {
    return type
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <Container size="lg">
      <h1>{quiz.name}</h1>
      <Text>{quiz.description}</Text>
      <Space h="md" />
      <Text>Created by user: {quiz.owner.username} </Text>
      <h2>Questions:</h2>
      {quiz.questions.map((question, index) => (
        <BorderedCard key={index}>
          <div key={index}>
            <Title order={3}>{question.question}</Title>
            <Space h="sm" />
            <Title order={4}>Type: {formatQuestionType(question.type)}</Title>
            {question.type === 'multipleChoice' && (
              <>
                <h4>Options</h4>
                <OptionsList options={question.options} />
              </>
            )}
            {question.answer && <p>Answer: {question.answer}</p>}
          </div>
        </BorderedCard>
      ))}
    </Container>
  );
}

export default QuizView;
