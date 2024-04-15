import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizForm from '../components/QuizForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';

function QuizCreate() {
  const navigate = useNavigate();

  const postQuiz = async (quiz) => {
    try {
      await fetch(QUIZZES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(quiz),
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  return <QuizForm onSubmit={postQuiz} />;
}

export default QuizCreate;
