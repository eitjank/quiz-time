import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizForm from '../components/QuizForm';

function QuizEdit() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setQuestions(data.questions);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const updateQuiz = async (e) => {
    try {
      await fetch(`http://localhost:3001/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, questions }),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (!questions) return <div>Loading...</div>;

  return (
    <QuizForm
      initialQuiz={{ name, description, questions }}
      onSubmit={updateQuiz}
    />
  );
}

export default QuizEdit;
