import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizForm from '../components/QuizForm';

function QuizCreate() {
  const navigate = useNavigate();

  const postQuiz = async (quiz) => {
    try {
      await fetch('http://localhost:3001/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return <QuizForm onSubmit={postQuiz} />;
}

export default QuizCreate;
