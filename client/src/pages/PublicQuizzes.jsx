import React from 'react';
import QuizList from '../components/QuizList';
import { QUIZZES_ENDPOINT } from '../api/endpoints';

function PublicQuizzes() {
  return <QuizList endpoint={QUIZZES_ENDPOINT} />;
}

export default PublicQuizzes;
