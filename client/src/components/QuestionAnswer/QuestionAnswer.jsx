import React from 'react';
import { Text } from '@mantine/core';

const QuestionAnswer = ({ question }) => {
  return (
    <>
      {question.answer && (
        <Text>Answer: {question.answer.join(', ')}</Text>
      )}
    </>
  );
};

export default QuestionAnswer;
