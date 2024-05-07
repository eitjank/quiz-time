import React from 'react';
import { Card, CardSection, Space, Text } from '@mantine/core';
import { BASE_URL } from '../api/endpoints';
import QuestionAnswer from './QuestionAnswer/QuestionAnswer';

const CurrentQuestion = ({ currentQuestion, renderQuestionInput, answer }) => {
  return (
    <div>
      <Card shadow="xs" radius="md">
        {currentQuestion.image && (
          <CardSection>
            {currentQuestion.image && (
              <img
                src={`${BASE_URL}/${currentQuestion.image}`}
                alt="Question"
              />
            )}
          </CardSection>
        )}
        <Text size="lg">{currentQuestion.question}</Text>
      </Card>
      <Space h="sm" />
      {renderQuestionInput(currentQuestion)}
      <QuestionAnswer answer={answer} />
    </div>
  );
};

export default CurrentQuestion;
