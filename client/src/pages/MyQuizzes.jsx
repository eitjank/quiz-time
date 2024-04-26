import React from 'react';
import QuizList from '../components/QuizList';
import { PERSONAL_QUIZZES_ENDPOINT } from '../api/endpoints';

const MyQuizzes = () => {
  return <QuizList endpoint={PERSONAL_QUIZZES_ENDPOINT} myQuizzes />;
};

export default MyQuizzes;
