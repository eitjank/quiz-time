import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizForm from '../components/QuizForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';

function QuizCreate() {
  const navigate = useNavigate();

  const postQuiz = async (quiz) => {
    try {
      await fetch(QUIZZES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(quiz),
      }).then((res) => {
        if (!res.ok) {
          toast.error(`Failed to create quiz. ${res.statusText}`);
          throw new Error(`Failed to create quiz. ${res.statusText}`);
        }

        if (res.status === 201) {
          toast('Quiz created successfully');
        } else {
          toast.error(`Failed to create quiz. ${res.statusText}`);
        }
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  return <QuizForm onSubmit={postQuiz} />;
}

export default QuizCreate;
