import React from 'react';
import { Card, CardSection, Text } from '@mantine/core';
import { BASE_URL } from '../api/endpoints';
import QuestionAnswer from './QuestionAnswer/QuestionAnswer';

const CurrentQuestion = ({
  currentQuestion,
  renderQuestionInput,
  showAnswer,
}) => {
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
      {renderQuestionInput(currentQuestion)}
      {showAnswer && <QuestionAnswer question={currentQuestion} />}
    </div>
  );
};

export default CurrentQuestion;
