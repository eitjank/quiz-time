import React from 'react';
import QuizList from '../components/QuizList';
import { PRIVATE_QUIZZES_ENDPOINT } from '../api/endpoints';

const MyQuizzes = () => {
  return <QuizList endpoint={PRIVATE_QUIZZES_ENDPOINT} myQuizzes />;
};

export default MyQuizzes;
