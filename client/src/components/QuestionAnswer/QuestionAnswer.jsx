import React from 'react';
import { Text } from '@mantine/core';

const QuestionAnswer = ({ answer }) => {
  return <>{answer && <Text>Answer: {answer.join(', ')}</Text>}</>;
};

export default QuestionAnswer;
