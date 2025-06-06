import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizForm from '../components/QuizForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';
import { Loader } from '@mantine/core';

function QuizEdit() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          toast.error(`Failed to fetch quiz. ${res.statusText}`);
          throw new Error('Failed to fetch quiz');
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setQuestions(data.questions);
        setVisibility(data.visibility);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const updateQuiz = async (quiz) => {
    try {
      await fetch(`${QUIZZES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(quiz),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        }
        if (res.status === 200) toast('Quiz updated successfully');
      });
      navigate(-1);
    } catch (err) {
      toast.error(`Failed to update quiz. ${err.message}`);
      console.error(err);
    }
  };

  if (!questions) return <Loader />;

  return (
    <QuizForm
      initialQuiz={{ id, name, description, questions, visibility }}
      onSubmit={updateQuiz}
    />
  );
}

export default QuizEdit;
