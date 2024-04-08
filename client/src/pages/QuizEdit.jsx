import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizForm from '../components/QuizForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';

function QuizEdit() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
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
        body: JSON.stringify(quiz),
      });
      navigate('/');
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
