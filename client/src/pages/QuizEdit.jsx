import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizForm from '../components/QuizForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';

function QuizEdit() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}`, { credentials: 'include' })
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
          toast.error(`Failed to update quiz. ${res.statusText}`);
          throw new Error(`Failed to update quiz. ${res.statusText}`);
        }
        if (res.status === 200) toast('Quiz updated successfully');
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  if (!questions) return <div>Loading...</div>;

  return (
    <QuizForm
      initialQuiz={{ id, name, description, questions, visibility }}
      onSubmit={updateQuiz}
    />
  );
}

export default QuizEdit;
