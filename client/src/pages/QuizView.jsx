import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { Container, Text, Paper, Space } from '@mantine/core';
import OptionsList from '../components/OptionsList/OptionsList';

function QuizView() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}`, { credentials: 'include' })
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
      <h2>Questions:</h2>
      {quiz.questions.map((question, index) => (
        <Paper padding="lg" shadow="xs" radius="md" key={index}>
          <div key={index}>
            <h3>{question.question}</h3>
            <h4>Type: {formatQuestionType(question.type)}</h4>
            {question.type === 'multipleChoice' && (
              <>
                <h4>Options</h4>
                <OptionsList options={question.options} />
              </>
            )}
            {question.answer && <p>Answer: {question.answer}</p>}
            <Space h="md" />
          </div>
        </Paper>
      ))}
    </Container>
  );
}

export default QuizView;
